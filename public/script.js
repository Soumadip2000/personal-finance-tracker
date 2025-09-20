document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const expenseForm = document.getElementById('expense-form');
    const expensesTableBody = document.getElementById('expenses-table-body');
    const categorySelect = document.getElementById('category');

    // Summary Card Elements
    const totalExpensesEl = document.getElementById('total-expenses');
    const expenseCountEl = document.getElementById('expense-count');
    const avgExpenseEl = document.getElementById('avg-expense');

    // Chart
    const chartCtx = document.getElementById('expense-chart').getContext('2d');
    let expenseChart;

    // --- DATA LOADING AND RENDERING ---

    async function loadCategories() {
        try {
            const response = await fetch('/api/categories');
            const categories = await response.json();
            categorySelect.innerHTML = '<option value="" disabled selected>Select a category...</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    async function loadExpenses() {
        try {
            const response = await fetch('/api/expenses');
            const expenses = await response.json();
            
            // 1. Update the table
            expensesTableBody.innerHTML = '';
            expenses.forEach(exp => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>₹${exp.amount.toFixed(2)}</td>
                    <td>${exp.description}</td>
                    <td>${exp.category_name}</td>
                    <td>${exp.date}</td>
                `;
                expensesTableBody.appendChild(row);
            });

            // 2. Update the summary cards
            updateSummary(expenses);

            // 3. Update the chart
            renderChart(expenses);

        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    }

    function updateSummary(expenses) {
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const count = expenses.length;
        const avg = count > 0 ? total / count : 0;

        totalExpensesEl.textContent = `₹${total.toFixed(2)}`;
        expenseCountEl.textContent = count;
        avgExpenseEl.textContent = `₹${avg.toFixed(2)}`;
    }
    
    function renderChart(expenses) {
        const categoryTotals = expenses.reduce((acc, exp) => {
            acc[exp.category_name] = (acc[exp.category_name] || 0) + exp.amount;
            return acc;
        }, {});

        const chartLabels = Object.keys(categoryTotals);
        const chartData = Object.values(categoryTotals);

        if (expenseChart) {
            expenseChart.destroy();
        }

        expenseChart = new Chart(chartCtx, {
            type: 'pie',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Expenses by Category',
                    data: chartData,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                }
            }
        });
    }

    // --- EVENT LISTENERS ---

    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const expenseData = {
            amount: parseFloat(document.getElementById('amount').value),
            description: document.getElementById('description').value,
            category_id: parseInt(categorySelect.value),
            date: document.getElementById('date').value
        };

        if (!expenseData.category_id || !expenseData.date) {
            alert('Please fill out all fields.');
            return;
        }

        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expenseData),
            });
            if (!response.ok) throw new Error('Failed to add expense');
            expenseForm.reset();
            loadExpenses(); // Refresh all data on success
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    });

    // --- INITIAL LOAD ---
    function initialize() {
        loadCategories();
        loadExpenses();
        // Set date to today by default
        document.getElementById('date').valueAsDate = new Date();
    }

    initialize();
});
// --- ✨ Interactive Background Initialization ---
// This code runs after everything else and creates the background effect.
// --- ✨ Interactive Background Initialization ---
window.addEventListener('load', () => {
    tsParticles.load({
        id: "tsparticles",
        options: {
            fpsLimit: 60,
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: "bubble", // Makes particles grow when you mouse over them
                    },
                },
                modes: {
                    bubble: {
                        distance: 250,
                        duration: 2,
                        opacity: 0.8,
                        size: 10,
                    },
                },
            },
            particles: {
                color: { value: "#ffffff" },
                // Snowflakes don't have links, so we disable them
                links: {
                    enable: false,
                },
                move: {
                    enable: true,
                    direction: "bottom", // Particles fall downwards
                    speed: { min: 1, max: 2 }, // Fall at a slow, variable speed
                    wobble: { // Adds a gentle side-to-side sway
                        enable: true,
                        distance: 10,
                        speed: 10,
                    },
                    straight: false,
                },
                number: {
                    density: {
                        enable: true,
                    },
                    value: 200, // Number of snowflakes
                },
                opacity: {
                    value: { min: 0.1, max: 0.5 }, // Varying opacity
                },
                shape: { type: "circle" },
                size: {
                    value: { min: 1, max: 4 }, // Varying snowflake sizes
                },
            },
            detectRetina: true,
        },
    });
});
window.addEventListener('load', () => {
    tsParticles.load({
        id: "tsparticles",
        options: {
            fpsLimit: 60,
            interactivity: {
                events: {
                    // This section makes the background react to clicks and taps
                    onClick: {
                        enable: true,
                        mode: "push", // The mode "push" adds new particles
                    },
                },
                modes: {
                    // Configures the "push" mode to add 4 new particles on each click
                    push: {
                        quantity: 4,
                    },
                },
            },
            particles: {
                color: { value: "#ffffff" },
                links: { enable: false },
                move: {
                    enable: true,
                    direction: "bottom-right", // Makes particles fall with a slight diagonal drift
                    speed: { min: 1, max: 3 },
                    // This wobble effect simulates the fluttering of snowflakes in the wind
                    wobble: {
                        enable: true,
                        distance: 15,
                        speed: 10,
                    },
                    straight: false,
                    outModes: "out",
                },
                number: {
                    density: { enable: true },
                    value: 150, // Reduced slightly for a cleaner look
                },
                opacity: { value: { min: 0.1, max: 0.6 } },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 4 } },
            },
            detectRetina: true,
        },
    });
});
