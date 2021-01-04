

module.exports = mil_type => {
    if (mil_type == 12) return 2.47
    else if (mil_type == 20) return 2.85
    throw new Error("MilType invalid")
}