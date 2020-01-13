const compare = (choice1, choice2) => {
    if(choice1 === choice2) {
        return 1
    }

    if (choice1 === "rock") {
        if(choice2 === "scissors") {
            return 3
        } else {
            return -1
        }
    }

    if (choice1 === "paper") {
        if(choice2 === "rock") {
            return 3
        } else {
            return -1
        }
    }

    if (choice1 === "scissors") {
        if(choice2 === "paper") {
            return 3
        } else {
            return -1
        }
    }
}

module.exports = compare