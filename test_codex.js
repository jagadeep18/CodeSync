(async () => {
    try {
        const response = await fetch('https://api.codex.jaagrav.in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: 'print("Hello from CodeX!")',
                language: 'py',
                input: ''
            })
        });
        const data = await response.json();
        console.log("Success:", data);
    } catch (error) {
        console.error("Error:", error);
    }
})();
