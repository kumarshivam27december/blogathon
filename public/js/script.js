// Navbar scroll effect
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Toggle registration number field
function toggleRegNo() {
    const regNoInput = document.getElementById('registrationNo');
    const isLpu = document.getElementById('lpuYes')?.checked; // Use optional chaining
    if (regNoInput && isLpu !== undefined) {
        regNoInput.required = isLpu;
    }
}

// Toggle team fields
function toggleTeamFields() {
    const teamFields = document.getElementById('teamFields');
    const isTeam = document.getElementById('team')?.checked; // Use optional chaining
    if (teamFields && isTeam !== undefined) {
        teamFields.classList.toggle('hidden', !isTeam);
    }
}

// Initialize form fields
document.addEventListener('DOMContentLoaded', () => {
    toggleRegNo();
    toggleTeamFields();

    // Add event listeners for dynamic changes
    const lpuYes = document.getElementById('lpuYes');
    const lpuNo = document.getElementById('lpuNo');
    const team = document.getElementById('team');
    const solo = document.getElementById('solo');

    if (lpuYes && lpuNo) {
        lpuYes.addEventListener('change', toggleRegNo);
        lpuNo.addEventListener('change', toggleRegNo);
    }

    if (team && solo) {
        team.addEventListener('change', toggleTeamFields);
        solo.addEventListener('change', toggleTeamFields);
    }
});