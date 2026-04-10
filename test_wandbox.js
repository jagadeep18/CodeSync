(async () => {
    try {
        const response = await fetch('https://wandbox.org/api/list.json');
        const data = await response.json();
        // find a python and node compiler
        console.log(data.filter(c => c.language === 'Python' || c.language === 'JavaScript').map(c => c.name));
    } catch (error) {
        console.error("Error:", error);
    }
})();
