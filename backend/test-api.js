async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test',
                email: 'test' + Date.now() + '@uni.edu',
                password: 'password123',
                role: 'student',
                degree: 'SE',
                year: "1",
                status: 'active'
            })
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Body:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
