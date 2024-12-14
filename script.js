// JavaScript for Form Submission
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    const response = `Thank you, ${name}! We will contact you at ${email}.`;
    document.getElementById('form-response').textContent = response;

    // Clear form fields
    this.reset();
});
