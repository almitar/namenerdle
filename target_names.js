const targetNames = {
    "2024-05-31": { name: "CHLOE", gender: "female" },
    "2024-06-01": { name: "GRACE", gender: "female" },
    "2024-06-02": { name: "DAVID", gender: "male" },
    "2024-06-03": { name: "PAULA", gender: "female" },
    "2024-06-04": { name: "ETHAN", gender: "male" },
    "2024-06-05": { name: "KAYLA", gender: "female" },
    "2024-06-06": { name: "MARLA", gender: "female" },
    "2024-06-07": { name: "FLORA", gender: "female" },
    "2024-06-08": { name: "DAISY", gender: "female" },
    "2024-06-09": { name: "ELIZA", gender: "female" },
    "2024-06-10": { name: "LUCAS", gender: "male" },
};

// Function to get the target name for today's date
function getTargetNameForToday() {
    const today = new Date().toISOString().split('T')[0];
    return targetNames[today];
}

// Function to get the game ID based on the date
function getGameID(date) {
    const startDate = new Date("2024-05-31");
    const currentDate = new Date(date);
    const differenceInTime = currentDate.getTime() - startDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays + 1;
}