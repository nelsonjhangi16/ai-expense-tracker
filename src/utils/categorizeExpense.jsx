export function categorizeExpense(title = "") {
  const text = title.toLowerCase();

  const categories = {
    Food: [
      "pizza",
      "burger",
      "kfc",
      "mcdonald",
      "biryani",
      "restaurant",
      "food",
      "lunch",
      "dinner",
      "breakfast",
      "cafe",
      "coffee",
      "tea",
      "bbq",
      "snack",
      "drink",
      "fries",
      "shawarma",
      "zinger",
      "bakery",
      "ice cream",
      "dominos",
    ],

    Transport: [
      "uber",
      "careem",
      "taxi",
      "bus",
      "metro",
      "fuel",
      "petrol",
      "diesel",
      "bike",
      "car wash",
      "rickshaw",
      "train",
      "transport",
      "parking",
      "toll",
      "indrive",
      "bykea",
    ],

    Shopping: [
      "shopping",
      "shirt",
      "clothes",
      "shoes",
      "nike",
      "adidas",
      "mall",
      "amazon",
      "daraz",
      "bag",
      "watch",
      "jacket",
      "jeans",
      "cap",
      "perfume",
      "makeup",
      "cosmetics",
      "dress",
    ],

    Bills: [
      "electric",
      "electricity",
      "water",
      "gas",
      "internet",
      "wifi",
      "bill",
      "utility",
      "ptcl",
      "mobile bill",
      "phone bill",
      "maintenance",
      "rent",
    ],

    Entertainment: [
      "netflix",
      "spotify",
      "cinema",
      "movie",
      "youtube",
      "game",
      "gaming",
      "playstation",
      "xbox",
      "concert",
      "music",
      "subscription",
      "disney",
      "amazon prime",
    ],

    Health: [
      "doctor",
      "medicine",
      "hospital",
      "medical",
      "pharmacy",
      "checkup",
      "clinic",
      "tablet",
      "health",
      "surgery",
      "vitamins",
      "test",
      "lab",
    ],

    Education: [
      "course",
      "university",
      "college",
      "school",
      "fees",
      "books",
      "udemy",
      "coursera",
      "tuition",
      "education",
      "exam",
      "assignment",
      "stationery",
    ],

    Travel: [
      "flight",
      "hotel",
      "trip",
      "travel",
      "tour",
      "vacation",
      "airbnb",
      "booking",
      "resort",
      "ticket",
      "visa",
    ],

    Salary: [
      "salary",
      "income",
      "freelance",
      "payment",
      "client",
      "bonus",
      "earning",
      "profit",
      "revenue",
    ],

    Other: [],
  };

  for (const category in categories) {
    for (const keyword of categories[category]) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }

  return "Other";
}