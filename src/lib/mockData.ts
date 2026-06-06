export interface MenuItemOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemOptionGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number;
  options: MenuItemOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  dopaminePoints: number; // how many points user gets for order/actions
  optionGroups?: MenuItemOptionGroup[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  deliveryFee: number;
  priceRange: string;
  tags: string[];
  image: string;
  bannerImage: string;
  menu: {
    category: string;
    items: MenuItem[];
  }[];
  reviews: Review[];
}

export const CATEGORIES = [
  { id: "burgers", name: "Burgers", icon: "🍔" },
  { id: "pizza", name: "Pizza", icon: "🍕" },
  { id: "sushi", name: "Sushi", icon: "🍣" },
  { id: "tacos", name: "Tacos", icon: "🌮" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
];

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "mega-burger-corp",
    name: "Mega Burger Corp™",
    description: "Industrial strength cheese-melts & 100% simulated wagyu euphoria.",
    rating: 4.9,
    reviewsCount: 8421,
    deliveryTime: "12-18 min",
    deliveryFee: 1.99,
    priceRange: "$$",
    tags: ["Burgers", "Fast Food", "American"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80",
    menu: [
      {
        category: "Dopamine Specialties",
        items: [
          {
            id: "glitch-burger",
            name: "The Quantum Glitch Burger",
            description: "Triple beef patty, quad cheese, bacon strips, and our secret glowing radioactive-pink mayo. So good it breaks the space-time continuum.",
            price: 14.99,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80",
            dopaminePoints: 450,
            optionGroups: [
              {
                id: "cheese-add",
                name: "Cheese Customization",
                required: false,
                maxSelections: 2,
                options: [
                  { id: "extra-cheddar", name: "Extra Cheddar", price: 1.00 },
                  { id: "liquid-gold", name: "Liquid Gold Cheese Lava", price: 2.50 }
                ]
              },
              {
                id: "sauces",
                name: "Secret Glitch Sauces",
                required: false,
                maxSelections: 3,
                options: [
                  { id: "neon-mayo", name: "Glowing Pink Mayo", price: 0.50 },
                  { id: "truffle-oil", name: "Dopamine Truffle Drip", price: 1.99 }
                ]
              }
            ]
          },
          {
            id: "sadness-destroyer",
            name: "Sadness Destroyer Fries",
            description: "Crispy waffle-cut potatoes drenched in warm liquid cheddar, caramelized onions, and loaded with savory artificial tears.",
            price: 6.99,
            image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&auto=format&fit=crop&q=80",
            dopaminePoints: 200,
            optionGroups: [
              {
                id: "fries-style",
                name: "Fry Upgrade",
                required: false,
                maxSelections: 1,
                options: [
                  { id: "truffle-upgrade", name: "Truffle & Parmesan Crust", price: 2.00 }
                ]
              }
            ]
          }
        ]
      },
      {
        category: "Classic Fuel",
        items: [
          {
            id: "corporate-shill",
            name: "The Corporate Shill Burger",
            description: "A standard, solid, dependable cheeseburger that makes you feel like you are contributing to the economy.",
            price: 9.99,
            image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop&q=80",
            dopaminePoints: 150
          }
        ]
      }
    ],
    reviews: [
      {
        id: "r1",
        userName: "Chad_Deluxe",
        rating: 5,
        text: "I was having a mid-life crisis at 23, but the Quantum Glitch Burger solved it. The pink mayo makes my brain hum. Will order again in 5 minutes.",
        date: "2 hours ago"
      },
      {
        id: "r2",
        userName: "Spammy_McSpam",
        rating: 4.8,
        text: "Solid fry action. The liquid gold cheese lava should be sold in gallons.",
        date: "1 day ago"
      }
    ]
  },
  {
    id: "neon-tokyo-sushi",
    name: "Neon Tokyo Sushi 🏮",
    description: "Cyberpunk rolls, electric wasabi, and high-frequency umami.",
    rating: 4.8,
    reviewsCount: 3951,
    deliveryTime: "15-22 min",
    deliveryFee: 2.99,
    priceRange: "$$$",
    tags: ["Sushi", "Japanese", "Healthy"],
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1200&auto=format&fit=crop&q=80",
    menu: [
      {
        category: "Hyper Rolls",
        items: [
          {
            id: "cyber-dragon",
            name: "Cyber Dragon Roll",
            description: "Spicy tuna & tempura shrimp topped with eel, avocado, neon flying fish roe, and gold flakes. Shines under blacklight.",
            price: 18.99,
            image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&auto=format&fit=crop&q=80",
            dopaminePoints: 600,
            optionGroups: [
              {
                id: "spicy-level",
                name: "Wasabi Heat Index",
                required: true,
                maxSelections: 1,
                options: [
                  { id: "mild", name: "Safe (Mild)", price: 0 },
                  { id: "electric", name: "Electric Overdrive (Extra Spicy)", price: 1.00 }
                ]
              }
            ]
          },
          {
            id: "vaporwave-nigiri",
            name: "Vaporwave Salmon Nigiri",
            description: "Torched fatty salmon dusted with citrus zest, sweet soy glaze, and vaporized lavender mist.",
            price: 12.99,
            image: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=400&auto=format&fit=crop&q=80",
            dopaminePoints: 350
          }
        ]
      }
    ],
    reviews: [
      {
        id: "r3",
        userName: "VaporBeast",
        rating: 5,
        text: "The lavender mist hit my nostrils and I swear I saw retro grids in the sky. Placed 3 orders just to hear the cash register sound.",
        date: "3 hours ago"
      }
    ]
  },
  {
    id: "pacos-taco-palace",
    name: "Paco's Taco Palace 🌮",
    description: "Maximum spice street food designed to reboot your nervous system.",
    rating: 4.7,
    reviewsCount: 5201,
    deliveryTime: "8-14 min",
    deliveryFee: 0.99,
    priceRange: "$",
    tags: ["Tacos", "Mexican", "Spicy"],
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=1200&auto=format&fit=crop&q=80",
    menu: [
      {
        category: "System Shock Tacos",
        items: [
          {
            id: "volcano-taco",
            name: "The Volcano Resurrector",
            description: "Adobada pork, ghost pepper relish, pickled onions, and double avocado crema on hand-pressed blue corn tortillas.",
            price: 3.50,
            image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&auto=format&fit=crop&q=80",
            dopaminePoints: 120,
            optionGroups: [
              {
                id: "tortilla",
                name: "Tortilla Type",
                required: true,
                maxSelections: 1,
                options: [
                  { id: "blue-corn", name: "Blue Corn (Default)", price: 0 },
                  { id: "crispy-shell", name: "Dopamine Extra-Crisp Shell", price: 0.25 }
                ]
              }
            ]
          },
          {
            id: "taco-bucket",
            name: "Mega Taco Bucket (12 Tacos)",
            description: "A gigantic bucket of assorted street tacos to satisfy your deepest, darkest late-night cravings.",
            price: 29.99,
            image: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=400&auto=format&fit=crop&q=80",
            dopaminePoints: 900
          }
        ]
      }
    ],
    reviews: [
      {
        id: "r4",
        userName: "SpicyGamer",
        rating: 5,
        text: "The ghost pepper relish literally rebooted my brain. My level shot up to 'Spiced Overlord' in one sitting.",
        date: "5 hours ago"
      }
    ]
  },
  {
    id: "neon-sweet-heaven",
    name: "Neon Sweet Heaven 🍰",
    description: "Decadent sugary portals into pure happiness.",
    rating: 4.9,
    reviewsCount: 7120,
    deliveryTime: "10-15 min",
    deliveryFee: 1.49,
    priceRange: "$$",
    tags: ["Desserts", "Bakery", "Sweet"],
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=1200&auto=format&fit=crop&q=80",
    menu: [
      {
        category: "Serotonin Inducers",
        items: [
          {
            id: "unicorn-donut",
            name: "Unicorn Glaze Wormhole Donut",
            description: "Gigantic neon-pink frosted donut topped with edible star sparkles, space dust, and a filling of pure strawberry euphoria.",
            price: 4.99,
            image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&auto=format&fit=crop&q=80",
            dopaminePoints: 250,
            optionGroups: [
              {
                id: "donut-fill",
                name: "Extra Injection",
                required: false,
                maxSelections: 1,
                options: [
                  { id: "custard", name: "Caramel Serotonin Custard", price: 1.00 }
                ]
              }
            ]
          },
          {
            id: "rainbow-cake",
            name: "Hyper-Color Rainbow Cake",
            description: "Six layers of neon sponge cake frosted with vanilla buttercream and coated in popping candies that explode in your mouth.",
            price: 7.99,
            image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&auto=format&fit=crop&q=80",
            dopaminePoints: 400
          }
        ]
      }
    ],
    reviews: [
      {
        id: "r5",
        userName: "SugarHigh_99",
        rating: 5,
        text: "The popping candies in the rainbow cake gave me a physical brain shiver. 10/10.",
        date: "3 hours ago"
      }
    ]
  }
];
