import {
  DiningHallWithMenu,
  Post,
  MenuItemRecord,
  DailyMenu,
  ItemMaster,
  DiningHallHours,
  ItemWithRating,
} from "./types";

const now = new Date();
function hoursAgo(h: number): string {
  return new Date(now.getTime() - h * 3600_000).toISOString();
}

const today = now.toISOString().slice(0, 10);
const ts = now.toISOString();

// ============================================================================
// Canonical Item Master Data
// ============================================================================
export const mockItemMaster: ItemMaster[] = [
  // Breakfast/Brunch Items
  { id: "im1", canonical_name: "Scrambled Eggs", normalized_name: "scrambledeggs", category: "Breakfast", dietary_tags: ["vegetarian", "eggs"], created_at: ts, updated_at: ts },
  { id: "im2", canonical_name: "Chicken Sausage", normalized_name: "chickensausage", category: "Breakfast", dietary_tags: [], created_at: ts, updated_at: ts },
  { id: "im3", canonical_name: "Pancakes", normalized_name: "pancakes", category: "Breakfast", dietary_tags: ["vegetarian", "wheat", "milk"], created_at: ts, updated_at: ts },
  { id: "im4", canonical_name: "Fresh Fruit Salad", normalized_name: "freshfruitsalad", category: "Salad", dietary_tags: ["vegan"], created_at: ts, updated_at: ts },

  // Entrees
  { id: "im5", canonical_name: "Herb-Roasted Chicken", normalized_name: "herbroastedchicken", category: "Entree", dietary_tags: [], created_at: ts, updated_at: ts },
  { id: "im6", canonical_name: "Beef Bulgogi Bowl", normalized_name: "beefbulgogibowl", category: "Entree", dietary_tags: ["wheat", "soy"], created_at: ts, updated_at: ts },
  { id: "im7", canonical_name: "BBQ Pulled Pork", normalized_name: "bbqpulledpork", category: "Entree", dietary_tags: [], created_at: ts, updated_at: ts },
  { id: "im8", canonical_name: "Chicken Tenders", normalized_name: "chickentenders", category: "Entree", dietary_tags: ["wheat"], created_at: ts, updated_at: ts },
  { id: "im9", canonical_name: "Tofu Stir Fry", normalized_name: "tofustirfry", category: "Entree", dietary_tags: ["vegan", "soy"], created_at: ts, updated_at: ts },
  { id: "im10", canonical_name: "Spicy Tuna Roll", normalized_name: "spicytunaroll", category: "Entree", dietary_tags: ["fish", "soy"], created_at: ts, updated_at: ts },

  // Sides
  { id: "im11", canonical_name: "Garlic Mashed Potatoes", normalized_name: "garlicmashedpotatoes", category: "Side", dietary_tags: ["vegetarian", "milk"], created_at: ts, updated_at: ts },
  { id: "im12", canonical_name: "Caesar Salad", normalized_name: "caesarsalad", category: "Salad", dietary_tags: ["vegetarian", "milk", "wheat"], created_at: ts, updated_at: ts },
  { id: "im13", canonical_name: "Mushroom Risotto", normalized_name: "mushroomrisotto", category: "Side", dietary_tags: ["vegetarian", "milk"], created_at: ts, updated_at: ts },
  { id: "im14", canonical_name: "Mac & Cheese", normalized_name: "maccheese", category: "Side", dietary_tags: ["vegetarian", "wheat", "milk"], created_at: ts, updated_at: ts },
  { id: "im15", canonical_name: "Cornbread", normalized_name: "cornbread", category: "Side", dietary_tags: ["vegetarian", "wheat", "milk", "eggs"], created_at: ts, updated_at: ts },
  { id: "im16", canonical_name: "Coleslaw", normalized_name: "coleslaw", category: "Side", dietary_tags: ["vegetarian", "eggs"], created_at: ts, updated_at: ts },
  { id: "im17", canonical_name: "Garden Salad", normalized_name: "gardensalad", category: "Salad", dietary_tags: ["vegan"], created_at: ts, updated_at: ts },
  { id: "im18", canonical_name: "Miso Soup", normalized_name: "misosoup", category: "Soup", dietary_tags: ["vegan", "soy"], created_at: ts, updated_at: ts },

  // Pizza/Baked
  { id: "im19", canonical_name: "Cheese Pizza", normalized_name: "cheesepizza", category: "Entree", dietary_tags: ["vegetarian", "wheat", "milk"], created_at: ts, updated_at: ts },

  // Desserts
  { id: "im20", canonical_name: "Brownie", normalized_name: "brownie", category: "Dessert", dietary_tags: ["vegetarian", "wheat", "milk", "eggs"], created_at: ts, updated_at: ts },
  { id: "im21", canonical_name: "Chocolate Chip Cookies", normalized_name: "chocolatechipcookies", category: "Dessert", dietary_tags: ["vegetarian", "wheat", "milk", "eggs"], created_at: ts, updated_at: ts },

  // Additional Items
  { id: "im22", canonical_name: "Grilled Salmon", normalized_name: "grilledsalmon", category: "Entree", dietary_tags: ["fish"], created_at: ts, updated_at: ts },
  { id: "im23", canonical_name: "Veggie Burger", normalized_name: "veggieburger", category: "Entree", dietary_tags: ["vegan", "wheat", "soy"], created_at: ts, updated_at: ts },
  { id: "im24", canonical_name: "Sweet Potato Fries", normalized_name: "sweetpotatofries", category: "Side", dietary_tags: ["vegan"], created_at: ts, updated_at: ts },
  { id: "im25", canonical_name: "Tikka Masala", normalized_name: "tikkamasala", category: "Entree", dietary_tags: ["halal", "milk"], created_at: ts, updated_at: ts },
  { id: "im26", canonical_name: "Quinoa Bowl", normalized_name: "quinoabowl", category: "Entree", dietary_tags: ["vegan"], created_at: ts, updated_at: ts },
  { id: "im27", canonical_name: "Chicken Parmesan", normalized_name: "chickenparmesan", category: "Entree", dietary_tags: ["wheat", "milk"], created_at: ts, updated_at: ts },
  { id: "im28", canonical_name: "Steamed Broccoli", normalized_name: "steamedbroccoli", category: "Side", dietary_tags: ["vegan"], created_at: ts, updated_at: ts },
  { id: "im29", canonical_name: "Beef Tacos", normalized_name: "beeftacos", category: "Entree", dietary_tags: ["wheat", "milk"], created_at: ts, updated_at: ts },
  { id: "im30", canonical_name: "Vegetable Fried Rice", normalized_name: "vegetablefriedrice", category: "Entree", dietary_tags: ["vegan", "soy"], created_at: ts, updated_at: ts },
];

// ============================================================================
// Item Ratings (0.0-4.0 GPA scale)
// ============================================================================
export const mockItemRatings: Record<string, number> = {
  // High performers (3.5-4.0) - UPDATED with multiple reviews
  "im25": 4.0, // Tikka Masala ⭐ Perfect score
  "im5": 3.8,  // Herb-Roasted Chicken
  "im6": 3.8,  // Beef Bulgogi Bowl
  "im13": 3.7, // Mushroom Risotto
  "im3": 3.6,  // Pancakes
  "im22": 3.5, // Grilled Salmon
  "im10": 3.5, // Spicy Tuna Roll
  "im20": 3.5, // Brownie

  // Good (3.0-3.4)
  "im4": 3.4,  // Fresh Fruit Salad
  "im11": 3.3, // Garlic Mashed Potatoes
  "im27": 3.3, // Chicken Parmesan
  "im21": 3.2, // Cookies
  "im9": 3.2,  // Tofu Stir Fry
  "im24": 3.1, // Sweet Potato Fries
  "im2": 3.1,  // Chicken Sausage
  "im26": 3.0, // Quinoa Bowl
  "im18": 3.0, // Miso Soup

  // Average (2.5-2.9)
  "im23": 2.9, // Veggie Burger
  "im29": 2.9, // Beef Tacos
  "im7": 2.8,  // BBQ Pulled Pork
  "im1": 2.7,  // Scrambled Eggs
  "im17": 2.6, // Garden Salad
  "im14": 2.6, // Mac & Cheese
  "im28": 2.5, // Steamed Broccoli

  // Below average (2.0-2.4)
  "im16": 2.4, // Coleslaw
  "im15": 2.2, // Cornbread
  "im8": 2.2,  // Chicken Tenders
  "im19": 2.1, // Cheese Pizza

  // Poor (1.0-1.9)
  "im12": 1.9, // Caesar Salad
};

// ============================================================================
// Mock Posts with Reviews (0.0-4.0 ratings)
// ============================================================================
export const mockPosts: Post[] = [
  // Reviews for specific items
  {
    id: "p1",
    type: "review",
    title: "Crossroads herb chicken is INSANE tonight",
    body: "Whoever is on grill tonight at Crossroads needs a raise. The herb-roasted chicken was perfectly seasoned, crispy skin, juicy inside. Paired with the garlic mashed potatoes — 10/10 meal.",
    author: "hungryBear23",
    dining_hall_id: "1",
    item_master_id: "im5",
    rating: 3.8,
    upvotes: 47,
    downvotes: 3,
    comment_count: 0,
    created_at: hoursAgo(1),
  },
  {
    id: "p2",
    type: "review",
    title: "Cafe 3 bulgogi bowl is criminally underrated",
    body: "The beef bulgogi bowl is one of the best things on campus. Perfectly marinated, great portion size, and the rice is always fresh. Cafe 3 Asian station never misses.",
    author: "kbbqFan",
    dining_hall_id: "2",
    item_master_id: "im6",
    rating: 3.7,
    upvotes: 38,
    downvotes: 1,
    comment_count: 0,
    created_at: hoursAgo(3),
  },
  {
    id: "p3",
    type: "review",
    title: "Clark Kerr mac & cheese — mid at best",
    body: "I know everyone hypes the mac & cheese but today it was watery and underseasoned. The pulled pork was decent though. Maybe it depends on who's cooking?",
    author: "foodCritic_cal",
    dining_hall_id: "3",
    item_master_id: "im14",
    rating: 2.6,
    upvotes: 19,
    downvotes: 12,
    comment_count: 0,
    created_at: hoursAgo(5),
  },
  {
    id: "p5",
    type: "review",
    title: "Foothill pizza is a war crime",
    body: "I'm convinced they microwave the cheese pizza. Soggy crust, barely any sauce. The brownie was the only saving grace. Foothill really needs to step it up.",
    author: "pizzaConnoisseur",
    dining_hall_id: "4",
    item_master_id: "im19",
    rating: 2.1,
    upvotes: 91,
    downvotes: 8,
    comment_count: 0,
    created_at: hoursAgo(8),
  },
  {
    id: "p9",
    type: "review",
    title: "Mushroom risotto at Crossroads hits different",
    body: "Creamy, perfectly cooked rice, generous mushrooms. This is restaurant quality honestly. Best vegetarian option on campus.",
    author: "veggieVibe",
    dining_hall_id: "1",
    item_master_id: "im13",
    rating: 3.6,
    upvotes: 54,
    downvotes: 2,
    comment_count: 0,
    created_at: hoursAgo(10),
  },
  {
    id: "p10",
    type: "review",
    title: "Spicy tuna roll at Cafe 3 is legit",
    body: "Fresh fish, good spice level, rice not too packed. Better than some off-campus spots tbh.",
    author: "sushiLover",
    dining_hall_id: "2",
    item_master_id: "im10",
    rating: 3.4,
    upvotes: 29,
    downvotes: 3,
    comment_count: 0,
    created_at: hoursAgo(14),
  },
  {
    id: "p11",
    type: "review",
    title: "BBQ pulled pork is okay, not great",
    body: "Clark Kerr's pulled pork is decent but nothing special. A bit dry today. Needs more sauce.",
    author: "meatLover99",
    dining_hall_id: "3",
    item_master_id: "im7",
    rating: 2.8,
    upvotes: 15,
    downvotes: 7,
    comment_count: 0,
    created_at: hoursAgo(18),
  },
  {
    id: "p12",
    type: "review",
    title: "Foothill brownies > everything else there",
    body: "The only reason to go to Foothill. Fudgy, rich, perfect texture. 4.0 GPA dessert at a 1.8 GPA dining hall.",
    author: "dessertFirst",
    dining_hall_id: "4",
    item_master_id: "im20",
    rating: 3.4,
    upvotes: 67,
    downvotes: 4,
    comment_count: 0,
    created_at: hoursAgo(22),
  },
  {
    id: "p13",
    type: "review",
    title: "Tikka masala is a must-try",
    body: "Crossroads tikka masala during halal night is phenomenal. Rich sauce, tender chicken, pairs perfectly with naan. Genuinely restaurant quality.",
    author: "curryKing",
    dining_hall_id: "1",
    item_master_id: "im25",
    rating: 3.9,
    upvotes: 82,
    downvotes: 3,
    comment_count: 0,
    created_at: hoursAgo(26),
  },
  {
    id: "p14",
    type: "review",
    title: "Tofu stir fry is solid vegan option",
    body: "Cafe 3's tofu stir fry is well-seasoned and not mushy. Good veggie variety. Solid 3.1.",
    author: "plantPowered",
    dining_hall_id: "2",
    item_master_id: "im9",
    rating: 3.1,
    upvotes: 23,
    downvotes: 5,
    comment_count: 0,
    created_at: hoursAgo(30),
  },
  {
    id: "p15",
    type: "review",
    title: "Chicken tenders are disappointing",
    body: "Foothill chicken tenders taste like frozen ones from Costco. Dry and bland. Skip.",
    author: "tenderCritic",
    dining_hall_id: "4",
    item_master_id: "im8",
    rating: 2.3,
    upvotes: 31,
    downvotes: 9,
    comment_count: 0,
    created_at: hoursAgo(36),
  },
  {
    id: "p16",
    type: "review",
    title: "Grilled salmon is surprisingly good",
    body: "Crossroads nailed the salmon tonight. Flaky, well-seasoned, lemon butter sauce on point. Don't sleep on fish night.",
    author: "seafoodSnob",
    dining_hall_id: "1",
    item_master_id: "im22",
    rating: 3.5,
    upvotes: 41,
    downvotes: 6,
    comment_count: 0,
    created_at: hoursAgo(48),
  },
  {
    id: "p17",
    type: "review",
    title: "Garlic mashed potatoes are comfort food",
    body: "Creamy, garlicky, perfect side dish. Crossroads does these right. Solid 3.2 GPA side.",
    author: "potatoFanatic",
    dining_hall_id: "1",
    item_master_id: "im11",
    rating: 3.2,
    upvotes: 28,
    downvotes: 2,
    comment_count: 0,
    created_at: hoursAgo(52),
  },
  {
    id: "p18",
    type: "review",
    title: "Chicken parmesan is worth the hype",
    body: "Breading is crispy, cheese is melted perfectly, sauce is tangy. Cafe 3 Italian night doesn't disappoint.",
    author: "italianFood4Life",
    dining_hall_id: "2",
    item_master_id: "im27",
    rating: 3.3,
    upvotes: 36,
    downvotes: 4,
    comment_count: 0,
    created_at: hoursAgo(60),
  },
  {
    id: "p19",
    type: "review",
    title: "Quinoa bowl is healthy but bland",
    body: "Clark Kerr's quinoa bowl is nutritious but needs more seasoning. Add hot sauce to make it edible.",
    author: "healthNut2024",
    dining_hall_id: "3",
    item_master_id: "im26",
    rating: 3.0,
    upvotes: 18,
    downvotes: 8,
    comment_count: 0,
    created_at: hoursAgo(72),
  },
  {
    id: "p20",
    type: "review",
    title: "Sweet potato fries are fire",
    body: "Crispy on the outside, soft inside. Crossroads sweet potato fries are addictive. Get them while they're hot.",
    author: "friesAddict",
    dining_hall_id: "1",
    item_master_id: "im24",
    rating: 3.1,
    upvotes: 44,
    downvotes: 5,
    comment_count: 0,
    created_at: hoursAgo(84),
  },
  {
    id: "p21",
    type: "review",
    title: "Scrambled eggs are standard breakfast fare",
    body: "Nothing special but gets the job done. Fluffy and well-seasoned. Better with hot sauce from the condiment bar.",
    author: "breakfastLover",
    dining_hall_id: "1",
    item_master_id: "im1",
    rating: 2.8,
    upvotes: 12,
    downvotes: 3,
    comment_count: 0,
    created_at: hoursAgo(90),
  },
  {
    id: "p22",
    type: "review",
    title: "Chicken sausage is actually decent",
    body: "Not too greasy, good flavor. Way better than the pork sausage they used to serve. Solid protein option for brunch.",
    author: "proteinSeeker",
    dining_hall_id: "1",
    item_master_id: "im2",
    rating: 3.0,
    upvotes: 18,
    downvotes: 2,
    comment_count: 0,
    created_at: hoursAgo(96),
  },
  {
    id: "p23",
    type: "review",
    title: "Pancakes are fluffy perfection",
    body: "Light, fluffy, perfect with maple syrup. Add some fresh fruit and you've got yourself a proper breakfast. One of the best items at Crossroads brunch.",
    author: "pancakePro",
    dining_hall_id: "1",
    item_master_id: "im3",
    rating: 3.5,
    upvotes: 42,
    downvotes: 1,
    comment_count: 0,
    created_at: hoursAgo(102),
  },
  {
    id: "p24",
    type: "review",
    title: "Fresh fruit salad is refreshing",
    body: "Always fresh, good variety of fruits. Perfect light option or dessert. Wish they had more exotic fruits though.",
    author: "healthyEater",
    dining_hall_id: "1",
    item_master_id: "im4",
    rating: 3.3,
    upvotes: 25,
    downvotes: 4,
    comment_count: 0,
    created_at: hoursAgo(108),
  },
  {
    id: "p25",
    type: "review",
    title: "Caesar salad is hit or miss",
    body: "Sometimes the lettuce is crisp and fresh, other times it's wilted. Dressing is okay but could use more parmesan. Croutons are good though.",
    author: "saladCritic",
    dining_hall_id: "1",
    item_master_id: "im12",
    rating: 1.8,
    upvotes: 14,
    downvotes: 8,
    comment_count: 0,
    created_at: hoursAgo(114),
  },
  {
    id: "p26",
    type: "review",
    title: "Miso soup is surprisingly authentic",
    body: "Good umami flavor, proper tofu and seaweed. Great as a light meal or side. Cafe 3 knows their Asian food.",
    author: "soupEnthusiast",
    dining_hall_id: "2",
    item_master_id: "im18",
    rating: 2.8,
    upvotes: 20,
    downvotes: 3,
    comment_count: 0,
    created_at: hoursAgo(120),
  },
  {
    id: "p27",
    type: "review",
    title: "Cornbread is dry and crumbly",
    body: "Needs butter to be edible. Too dry on its own. Clark Kerr should work on this recipe.",
    author: "southernFood",
    dining_hall_id: "3",
    item_master_id: "im15",
    rating: 2.2,
    upvotes: 16,
    downvotes: 5,
    comment_count: 0,
    created_at: hoursAgo(126),
  },
  {
    id: "p28",
    type: "review",
    title: "Coleslaw is mediocre at best",
    body: "Too much mayo, not enough vinegar tang. Cabbage is chopped inconsistently. Skip and get something else.",
    author: "slawSkipper",
    dining_hall_id: "3",
    item_master_id: "im16",
    rating: 2.4,
    upvotes: 11,
    downvotes: 6,
    comment_count: 0,
    created_at: hoursAgo(132),
  },
  {
    id: "p29",
    type: "review",
    title: "Garden salad is basic but fresh",
    body: "Nothing fancy - lettuce, tomatoes, cucumbers. But at least it's fresh. Good if you need veggies with your meal.",
    author: "veggieConsumer",
    dining_hall_id: "4",
    item_master_id: "im17",
    rating: 2.6,
    upvotes: 9,
    downvotes: 4,
    comment_count: 0,
    created_at: hoursAgo(138),
  },
  {
    id: "p30",
    type: "review",
    title: "Scrambled eggs consistency varies",
    body: "Sometimes perfect, sometimes overcooked and rubbery. Depends on the timing honestly. Get there early for the best batch.",
    author: "earlyBird",
    dining_hall_id: "1",
    item_master_id: "im1",
    rating: 2.5,
    upvotes: 8,
    downvotes: 2,
    comment_count: 0,
    created_at: hoursAgo(144),
  },
  {
    id: "p31",
    type: "review",
    title: "Caesar salad dressing is too heavy",
    body: "Way too much dressing, drowns the lettuce. Wish they'd go lighter on it or serve it on the side.",
    author: "dressingDebater",
    dining_hall_id: "1",
    item_master_id: "im12",
    rating: 1.9,
    upvotes: 7,
    downvotes: 11,
    comment_count: 0,
    created_at: hoursAgo(150),
  },
  {
    id: "p32",
    type: "review",
    title: "Multiple reviews for miso soup",
    body: "I come back for this soup every week. Perfect temperature, not too salty. Cafe 3's best kept secret.",
    author: "soupAddict",
    dining_hall_id: "2",
    item_master_id: "im18",
    rating: 3.2,
    upvotes: 15,
    downvotes: 1,
    comment_count: 0,
    created_at: hoursAgo(156),
  },

  // Additional reviews for complete coverage
  {
    id: "p33",
    type: "review",
    title: "Herb chicken is consistently good",
    body: "I order this every week. Never disappointed. The seasoning is on point and it's always juicy. Crossroads' best entree.",
    author: "chickenFanatic",
    dining_hall_id: "1",
    item_master_id: "im5",
    rating: 3.7,
    upvotes: 33,
    downvotes: 2,
    comment_count: 0,
    created_at: hoursAgo(162),
  },
  {
    id: "p34",
    type: "review",
    title: "Bulgogi bowl never misses",
    body: "The beef is marinated perfectly, rice is fluffy. This is what I come to Cafe 3 for. Easily 3.7 GPA.",
    author: "asianFoodLover",
    dining_hall_id: "2",
    item_master_id: "im6",
    rating: 3.8,
    upvotes: 45,
    downvotes: 3,
    comment_count: 0,
    created_at: hoursAgo(168),
  },
  {
    id: "p35",
    type: "review",
    title: "Pulled pork needs improvement",
    body: "Too dry, needs more BBQ sauce. The flavor is there but execution is lacking. Clark Kerr can do better.",
    author: "bbqCritic",
    dining_hall_id: "3",
    item_master_id: "im7",
    rating: 2.7,
    upvotes: 12,
    downvotes: 4,
    comment_count: 0,
    created_at: hoursAgo(174),
  },
  {
    id: "p36",
    type: "review",
    title: "Tenders are frozen garbage",
    body: "Straight from a Costco bag. Dry, no flavor. Foothill's worst offering. Hard pass.",
    author: "tendersHater",
    dining_hall_id: "4",
    item_master_id: "im8",
    rating: 2.0,
    upvotes: 28,
    downvotes: 6,
    comment_count: 0,
    created_at: hoursAgo(180),
  },
  {
    id: "p37",
    type: "review",
    title: "Tofu stir fry is solid",
    body: "Well-seasoned, good texture. Best vegan option at Cafe 3. Veggies are fresh and crisp.",
    author: "veganStudent",
    dining_hall_id: "2",
    item_master_id: "im9",
    rating: 3.2,
    upvotes: 19,
    downvotes: 2,
    comment_count: 0,
    created_at: hoursAgo(186),
  },
  {
    id: "p38",
    type: "review",
    title: "Tuna roll is fire",
    body: "Fresh fish, perfect spice. Better than some restaurants honestly. Cafe 3 sushi station doesn't disappoint.",
    author: "sushiFan",
    dining_hall_id: "2",
    item_master_id: "im10",
    rating: 3.5,
    upvotes: 37,
    downvotes: 4,
    comment_count: 0,
    created_at: hoursAgo(192),
  },
  {
    id: "p39",
    type: "review",
    title: "Mashed potatoes are comfort food perfection",
    body: "Creamy, buttery, garlicky. The perfect side dish. Crossroads nails this every single time.",
    author: "comfortFoodFan",
    dining_hall_id: "1",
    item_master_id: "im11",
    rating: 3.3,
    upvotes: 24,
    downvotes: 1,
    comment_count: 0,
    created_at: hoursAgo(198),
  },
  {
    id: "p40",
    type: "review",
    title: "Risotto is restaurant quality",
    body: "Creamy, al dente rice, loaded with mushrooms. This is why Crossroads has the highest GPA. Amazing.",
    author: "risottoLover",
    dining_hall_id: "1",
    item_master_id: "im13",
    rating: 3.7,
    upvotes: 51,
    downvotes: 2,
    comment_count: 0,
    created_at: hoursAgo(204),
  },
  {
    id: "p41",
    type: "review",
    title: "Mac n cheese is watery",
    body: "Not creamy enough. Cheese sauce is thin. Clark Kerr needs to fix this recipe.",
    author: "macCheeseFan",
    dining_hall_id: "3",
    item_master_id: "im14",
    rating: 2.5,
    upvotes: 15,
    downvotes: 9,
    comment_count: 0,
    created_at: hoursAgo(210),
  },
  {
    id: "p42",
    type: "review",
    title: "Pizza is soggy mess",
    body: "Undercooked dough, too much cheese. Foothill's signature disappointment. 2.0 GPA at best.",
    author: "pizzaSnob",
    dining_hall_id: "4",
    item_master_id: "im19",
    rating: 2.0,
    upvotes: 42,
    downvotes: 7,
    comment_count: 0,
    created_at: hoursAgo(216),
  },
  {
    id: "p43",
    type: "review",
    title: "Brownies save Foothill",
    body: "Fudgy, rich, perfect texture. Only reason to visit Foothill. These are genuinely elite.",
    author: "chocolateLover",
    dining_hall_id: "4",
    item_master_id: "im20",
    rating: 3.5,
    upvotes: 63,
    downvotes: 3,
    comment_count: 0,
    created_at: hoursAgo(222),
  },
  {
    id: "p44",
    type: "review",
    title: "Tikka masala is phenomenal",
    body: "Rich sauce, tender chicken, perfect spice level. Halal night at Crossroads is the move. 4.0 GPA dish.",
    author: "indianFoodLover",
    dining_hall_id: "1",
    item_master_id: "im25",
    rating: 4.0,
    upvotes: 89,
    downvotes: 2,
    comment_count: 0,
    created_at: hoursAgo(228),
  },
  {
    id: "p45",
    type: "review",
    title: "Eggs are hit or miss",
    body: "Sometimes fluffy, sometimes rubbery. Depends when you go. Morning eggs are usually better.",
    author: "breakfastRegular",
    dining_hall_id: "1",
    item_master_id: "im1",
    rating: 2.9,
    upvotes: 11,
    downvotes: 5,
    comment_count: 0,
    created_at: hoursAgo(234),
  },
  {
    id: "p46",
    type: "review",
    title: "Chicken sausage is surprisingly good",
    body: "Better than pork sausage. Good flavor, not greasy. Solid breakfast protein.",
    author: "morningPerson",
    dining_hall_id: "1",
    item_master_id: "im2",
    rating: 3.1,
    upvotes: 16,
    downvotes: 3,
    comment_count: 0,
    created_at: hoursAgo(240),
  },
  {
    id: "p47",
    type: "review",
    title: "Pancakes are the best",
    body: "Fluffy, light, perfect with syrup and butter. Best breakfast item. Come early for these.",
    author: "pancakeLover22",
    dining_hall_id: "1",
    item_master_id: "im3",
    rating: 3.6,
    upvotes: 48,
    downvotes: 2,
    comment_count: 0,
    created_at: hoursAgo(246),
  },
  {
    id: "p48",
    type: "review",
    title: "Fruit salad is always fresh",
    body: "Good variety, always ripe. Perfect light option or healthy dessert. Crossroads does this right.",
    author: "healthyChoice",
    dining_hall_id: "1",
    item_master_id: "im4",
    rating: 3.4,
    upvotes: 27,
    downvotes: 3,
    comment_count: 0,
    created_at: hoursAgo(252),
  },

  // Recipe posts
  {
    id: "p4",
    type: "recipe",
    title: "Dining Hall Spicy Ramen Hack",
    body: "Grab a bowl of miso soup from Cafe 3, add sriracha, sesame oil from the condiment bar, and top with the stir-fry tofu. Trust me, it slaps harder than any instant ramen.",
    author: "noodleMaster",
    tagged_items: ["im18", "im9"],
    upvotes: 82,
    downvotes: 5,
    comment_count: 0,
    created_at: hoursAgo(7),
  },
  {
    id: "p6",
    type: "recipe",
    title: "Crossroads Burrito Bowl (DIY)",
    body: "Hit the salad bar for rice + black beans, grab grilled chicken from the grill station, add pico de gallo and guac. Wrap it in a tortilla or eat it bowl-style. Basically Chipotle for free.",
    author: "burritoEngineer",
    dining_hall_id: "1",
    tagged_items: ["im5"],
    upvotes: 63,
    downvotes: 2,
    comment_count: 0,
    created_at: hoursAgo(12),
  },
  {
    id: "p7",
    type: "recipe",
    title: "Late-Night Pancake Sandwich",
    body: "Two pancakes, a scoop of peanut butter, sliced banana, drizzle of honey. Make it at any hall during breakfast. Perfect pre-exam fuel.",
    author: "breakfastChamp",
    tagged_items: ["im3"],
    upvotes: 55,
    downvotes: 4,
    comment_count: 0,
    created_at: hoursAgo(20),
  },
  {
    id: "p8",
    type: "recipe",
    title: "Ice Cream Waffle Cone Hack",
    body: "Grab a waffle from breakfast, roll it into a cone shape while warm, then fill with soft serve from the dessert station. You're welcome.",
    author: "dessertHacker",
    upvotes: 72,
    downvotes: 6,
    comment_count: 0,
    created_at: hoursAgo(40),
  },
];

// ============================================================================
// Dining Hall Hours
// ============================================================================
export const mockDiningHallHours: DiningHallHours[] = [
  // Crossroads
  { id: "h1", dining_hall_id: "1", date: today, meal_period: "Breakfast", start_time: "07:00", end_time: "10:30", created_at: ts },
  { id: "h2", dining_hall_id: "1", date: today, meal_period: "Brunch", start_time: "10:30", end_time: "15:00", created_at: ts },
  { id: "h3", dining_hall_id: "1", date: today, meal_period: "Dinner", start_time: "16:30", end_time: "21:00", created_at: ts },

  // Cafe 3
  { id: "h4", dining_hall_id: "2", date: today, meal_period: "Breakfast", start_time: "07:00", end_time: "10:30", created_at: ts },
  { id: "h5", dining_hall_id: "2", date: today, meal_period: "Lunch", start_time: "11:00", end_time: "15:00", created_at: ts },
  { id: "h6", dining_hall_id: "2", date: today, meal_period: "Dinner", start_time: "16:30", end_time: "21:00", created_at: ts },

  // Clark Kerr
  { id: "h7", dining_hall_id: "3", date: today, meal_period: "Breakfast", start_time: "07:00", end_time: "10:00", created_at: ts },
  { id: "h8", dining_hall_id: "3", date: today, meal_period: "Lunch", start_time: "11:00", end_time: "14:30", created_at: ts },
  { id: "h9", dining_hall_id: "3", date: today, meal_period: "Dinner", start_time: "16:30", end_time: "20:00", created_at: ts },

  // Foothill
  { id: "h10", dining_hall_id: "4", date: today, meal_period: "Breakfast", start_time: "07:00", end_time: "10:00", created_at: ts },
  { id: "h11", dining_hall_id: "4", date: today, meal_period: "Lunch", start_time: "11:00", end_time: "14:30", created_at: ts },
  { id: "h12", dining_hall_id: "4", date: today, meal_period: "Dinner", start_time: "16:30", end_time: "20:00", created_at: ts },
];

// ============================================================================
// Updated Menu Items with item_master_id references
// ============================================================================
export const mockMenuItems: MenuItemRecord[] = [
  // Crossroads – Brunch
  { id: "mi1", dining_hall_id: "1", date: today, meal: "brunch", station: "Grill", item_name: "Scrambled Eggs", dietary_tags: ["vegetarian", "eggs"], carbon_footprint: 0.8, created_at: ts, item_master_id: "im1" },
  { id: "mi2", dining_hall_id: "1", date: today, meal: "brunch", station: "Grill", item_name: "Chicken Sausage", dietary_tags: [], carbon_footprint: 1.2, created_at: ts, item_master_id: "im2" },
  { id: "mi3", dining_hall_id: "1", date: today, meal: "brunch", station: "Comfort", item_name: "Pancakes", dietary_tags: ["vegetarian", "wheat", "milk"], carbon_footprint: 0.4, created_at: ts, item_master_id: "im3" },
  { id: "mi4", dining_hall_id: "1", date: today, meal: "brunch", station: "Salad Bar", item_name: "Fresh Fruit Salad", dietary_tags: ["vegan"], carbon_footprint: 0.2, created_at: ts, item_master_id: "im4" },

  // Crossroads – Dinner
  { id: "mi5", dining_hall_id: "1", date: today, meal: "dinner", station: "Grill", item_name: "Herb-Roasted Chicken", dietary_tags: [], carbon_footprint: 2.1, created_at: ts, item_master_id: "im5" },
  { id: "mi6", dining_hall_id: "1", date: today, meal: "dinner", station: "Comfort", item_name: "Garlic Mashed Potatoes", dietary_tags: ["vegetarian", "milk"], carbon_footprint: 0.5, created_at: ts, item_master_id: "im11" },
  { id: "mi7", dining_hall_id: "1", date: today, meal: "dinner", station: "Salad Bar", item_name: "Caesar Salad", dietary_tags: ["vegetarian", "milk", "wheat"], carbon_footprint: 0.3, created_at: ts, item_master_id: "im12" },
  { id: "mi8", dining_hall_id: "1", date: today, meal: "dinner", station: "Comfort", item_name: "Mushroom Risotto", dietary_tags: ["vegetarian", "milk"], carbon_footprint: 0.7, created_at: ts, item_master_id: "im13" },
  { id: "mi30", dining_hall_id: "1", date: today, meal: "dinner", station: "Entree", item_name: "Tikka Masala", dietary_tags: ["halal", "milk"], carbon_footprint: 1.5, created_at: ts, item_master_id: "im25" },

  // Cafe 3 – Dinner
  { id: "mi9", dining_hall_id: "2", date: today, meal: "dinner", station: "Asian", item_name: "Beef Bulgogi Bowl", dietary_tags: ["wheat", "soy"], carbon_footprint: 3.2, created_at: ts, item_master_id: "im6" },
  { id: "mi10", dining_hall_id: "2", date: today, meal: "dinner", station: "Asian", item_name: "Tofu Stir Fry", dietary_tags: ["vegan", "soy"], carbon_footprint: 0.6, created_at: ts, item_master_id: "im9" },
  { id: "mi11", dining_hall_id: "2", date: today, meal: "dinner", station: "Sushi", item_name: "Spicy Tuna Roll", dietary_tags: ["fish", "soy"], carbon_footprint: 1.5, created_at: ts, item_master_id: "im10" },
  { id: "mi12", dining_hall_id: "2", date: today, meal: "dinner", station: "Soup", item_name: "Miso Soup", dietary_tags: ["vegan", "soy"], carbon_footprint: 0.3, created_at: ts, item_master_id: "im18" },

  // Clark Kerr – Dinner
  { id: "mi13", dining_hall_id: "3", date: today, meal: "dinner", station: "Grill", item_name: "BBQ Pulled Pork", dietary_tags: [], carbon_footprint: 3.8, created_at: ts, item_master_id: "im7" },
  { id: "mi14", dining_hall_id: "3", date: today, meal: "dinner", station: "Bakery", item_name: "Cornbread", dietary_tags: ["vegetarian", "wheat", "milk", "eggs"], carbon_footprint: 0.3, created_at: ts, item_master_id: "im15" },
  { id: "mi15", dining_hall_id: "3", date: today, meal: "dinner", station: "Comfort", item_name: "Mac & Cheese", dietary_tags: ["vegetarian", "wheat", "milk"], carbon_footprint: 0.9, created_at: ts, item_master_id: "im14" },
  { id: "mi16", dining_hall_id: "3", date: today, meal: "dinner", station: "Salad Bar", item_name: "Coleslaw", dietary_tags: ["vegetarian", "eggs"], carbon_footprint: 0.2, created_at: ts, item_master_id: "im16" },

  // Foothill – Dinner
  { id: "mi17", dining_hall_id: "4", date: today, meal: "dinner", station: "Pizza", item_name: "Cheese Pizza", dietary_tags: ["vegetarian", "wheat", "milk"], carbon_footprint: 1.1, created_at: ts, item_master_id: "im19" },
  { id: "mi18", dining_hall_id: "4", date: today, meal: "dinner", station: "Salad Bar", item_name: "Garden Salad", dietary_tags: ["vegan"], carbon_footprint: 0.1, created_at: ts, item_master_id: "im17" },
  { id: "mi19", dining_hall_id: "4", date: today, meal: "dinner", station: "Grill", item_name: "Chicken Tenders", dietary_tags: ["wheat"], carbon_footprint: 1.8, created_at: ts, item_master_id: "im8" },
  { id: "mi20", dining_hall_id: "4", date: today, meal: "dinner", station: "Bakery", item_name: "Brownie", dietary_tags: ["vegetarian", "wheat", "milk", "eggs"], carbon_footprint: 0.4, created_at: ts, item_master_id: "im20" },
];

// ============================================================================
// Helper function: Get mock hall GPA (dynamically calculated)
// ============================================================================
export function getMockHallGpa(hallId: string, date: string = today): number {
  // Get all menu items for this hall on this date
  const hallMenuItems = mockMenuItems.filter(
    (mi) => mi.dining_hall_id === hallId && mi.date === date
  );

  // Get ratings for these items
  const ratings = hallMenuItems
    .map((mi) => mi.item_master_id ? mockItemRatings[mi.item_master_id] : null)
    .filter((r): r is number => r !== null && r !== undefined);

  if (ratings.length === 0) {
    // Fallback to static GPA if no ratings
    const staticGpas: Record<string, number> = {
      "1": 3.6, // Crossroads
      "2": 3.1, // Cafe 3
      "3": 2.4, // Clark Kerr
      "4": 1.8, // Foothill
    };
    return staticGpas[hallId] || 0.0;
  }

  const sum = ratings.reduce((acc, r) => acc + r, 0);
  const avg = sum / ratings.length;
  return Math.round(avg * 10) / 10; // Round to 1 decimal
}

// ============================================================================
// Helper function: Get top-rated items for a hall
// ============================================================================
export function getMockTopRatedItems(
  hallId: string,
  date: string = today,
  limit: number = 2
): ItemWithRating[] {
  // Get menu items for this hall on this date
  const hallMenuItems = mockMenuItems.filter(
    (mi) => mi.dining_hall_id === hallId && mi.date === date
  );

  // Build items with ratings
  const itemsWithRatings: ItemWithRating[] = hallMenuItems
    .map((mi) => {
      if (!mi.item_master_id) return null;

      const masterItem = mockItemMaster.find((im) => im.id === mi.item_master_id);
      if (!masterItem) return null;

      const rating = mockItemRatings[mi.item_master_id] || 0.0;
      const reviewCount = mockPosts.filter(
        (p) => p.type === "review" && p.item_master_id === mi.item_master_id
      ).length;

      return {
        ...masterItem,
        avg_rating: rating,
        review_count: reviewCount,
      };
    })
    .filter((item): item is ItemWithRating => item !== null);

  // Sort by rating (desc) and return top N
  return itemsWithRatings
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, limit);
}

// ============================================================================
// Updated dining halls with dynamic GPA
// ============================================================================
export const mockDiningHalls: DiningHallWithMenu[] = [
  {
    id: "1",
    name: "Crossroads",
    slug: "crossroads",
    gpa: getMockHallGpa("1"),
    menu: null, // Will be populated dynamically
  },
  {
    id: "2",
    name: "Cafe 3",
    slug: "cafe-3",
    gpa: getMockHallGpa("2"),
    menu: null,
  },
  {
    id: "3",
    name: "Clark Kerr",
    slug: "clark-kerr",
    gpa: getMockHallGpa("3"),
    menu: null,
  },
  {
    id: "4",
    name: "Foothill",
    slug: "foothill",
    gpa: getMockHallGpa("4"),
    menu: null,
  },
];

// ============================================================================
// Daily Menus
// ============================================================================
export const mockDailyMenus: DailyMenu[] = [
  { id: "dm1", dining_hall_id: "1", date: today, meal_period: "brunch", items: [], meal_start_time: "10:30", meal_end_time: "15:00" },
  { id: "dm2", dining_hall_id: "1", date: today, meal_period: "dinner", items: [], meal_start_time: "16:30", meal_end_time: "21:00" },
  { id: "dm3", dining_hall_id: "2", date: today, meal_period: "dinner", items: [], meal_start_time: "16:30", meal_end_time: "21:00" },
  { id: "dm4", dining_hall_id: "3", date: today, meal_period: "dinner", items: [], meal_start_time: "16:30", meal_end_time: "20:00" },
  { id: "dm5", dining_hall_id: "4", date: today, meal_period: "dinner", items: [], meal_start_time: "16:30", meal_end_time: "20:00" },
];
