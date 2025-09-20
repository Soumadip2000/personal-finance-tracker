//#define CPPHTTPLIB_OPENSSL_SUPPORT // For HTTPS support later
#include "httplib.h"
#include "sqlite_orm.h"
#include <iostream>
#include <nlohmann/json.hpp> // For downloading the nlohmann/json header for JSON handling

// For convenience
using json = nlohmann::json;
using namespace sqlite_orm;

// --- Database Structure ( mirroring SQL ) ---
struct Category {
    int id;
    std::string name;
};

struct Expense {
    int id;
    double amount;
    std::string description;
    std::string date;
    int category_id;
};
struct ExpenseWithCategory {
    int id;
    double amount;
    std::string description;
    std::string date;
    std::string category_name;
};
// --- Main Server Logic ---
int main() {
    // Add this code to define your database schema
    auto storage = make_storage("tracker.db",
                                make_table("categories",
                                           make_column("id", &Category::id, primary_key()),
                                           make_column("name", &Category::name, unique())),
                                make_table("expenses",
                                           make_column("id", &Expense::id, primary_key()),
                                           make_column("amount", &Expense::amount),
                                           make_column("description", &Expense::description),
                                           make_column("date", &Expense::date),
                                           make_column("category_id", &Expense::category_id)));
    httplib::Server svr;

    // This command tells the server to serve files from the "public" directory
    // e.g., when a browser requests "/", it will serve "public/index.html"
    svr.set_mount_point("/", "./public");

    std::cout << "Server starting on http://localhost:8080" << std::endl;
    // API Endpoint: GET /api/expenses - To fetch all expenses
    svr.Get("/api/categories", [&](const httplib::Request &, httplib::Response &res) {
        try {
            // Get all categories from the database
            auto categories = storage.get_all<Category>();
            json j = json::array(); // Create a new JSON array

            // Loop through categories and add them to the JSON array
            for (const auto &category : categories) {
                j.push_back({{"id", category.id}, {"name", category.name}});
            }
            
            // Send the JSON data back to the browser
            res.set_content(j.dump(), "application/json");
        } catch (const std::exception &e) {
            res.status = 500;
            res.set_content(e.what(), "text/plain");
        }
    });
// API Endpoint: POST /api/expenses - To add a new expense
    svr.Post("/api/expenses", [&](const httplib::Request &req, httplib::Response &res) {
        try {
            // Parse the JSON data sent from the browser
            auto data = json::parse(req.body);

            // Create a C++ Expense object from the JSON data
            Expense new_expense;
            new_expense.amount = data["amount"];
            new_expense.description = data["description"];
            new_expense.date = data["date"];
            new_expense.category_id = data["category_id"];

            // Insert the new expense object into the database
            storage.insert(new_expense);

            // Send back a success response (HTTP status 201 means "Created")
            res.status = 201; 
            res.set_content("{\"status\": \"success\"}", "application/json");

        } catch (const std::exception &e) {
            // If anything goes wrong, send back a detailed error
            res.status = 500;
            json error_response = {{"status", "error"}, {"message", e.what()}};
            res.set_content(error_response.dump(), "application/json");
        }
    });
    // This is the code to add for fetching all expenses
    svr.Get("/api/expenses", [&](const httplib::Request &, httplib::Response &res) {
        try {
            // This query gets all expenses and joins them with their category name.
            // It orders the results by ID in descending order to show the newest first.
            auto results = storage.select(
                columns(&Expense::id, &Expense::amount, &Expense::description, &Expense::date, &Category::name),
                join<Category>(on(c(&Expense::category_id) == &Category::id)),
                order_by(&Expense::id).desc()
            );

            json j = json::array();
            for(const auto& row : results) {
                // Build a JSON object for each expense
                j.push_back({
                    {"id", std::get<0>(row)},
                    {"amount", std::get<1>(row)},
                    {"description", std::get<2>(row)},
                    {"date", std::get<3>(row)},
                    {"category_name", std::get<4>(row)}
                });
            }

            res.set_content(j.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content(e.what(), "text/plain");
        }
    });
    svr.listen("0.0.0.0", 8080); // Listen on port 8080

    return 0;
}