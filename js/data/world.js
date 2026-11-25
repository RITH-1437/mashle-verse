/* Magic, creatures, organizations (h-), arcs and links.
   Magic is described by what it does; incantation names are left out
   until they are verified. */
window.V.data.magic = [
  { id: "m-muscle", name: "Muscle", kind: "No magic", users: ["mash"], arc: "s1", color: "#f3d38a",
    bio: "Not magic at all. Mash answers every spell with trained strength, speed and endurance." },
  { id: "m-gravity", name: "Gravity magic", kind: "Student magic", users: ["lance"], arc: "s1", color: "#c9a3ff",
    bio: "Lance increases the gravity on his target, pinning or crushing it." },
  { id: "m-explosion", name: "Explosion magic", kind: "Student magic", users: ["dot"], arc: "s1", color: "#ff8a65",
    bio: "Dot's magic detonates explosions, fitting his temper." },
  { id: "m-doll", name: "Doll magic", kind: "Antagonist magic", users: ["abel"], arc: "s1", color: "#9575cd",
    bio: "Abel Walker controls dolls and, through them, people." },
  { id: "m-evil-eye", name: "Evil Eye", kind: "Antagonist magic", users: ["abyss"], arc: "s1", color: "#7e57c2",
    bio: "The rare eye Abyss Razor was born with. People feared and shunned him for it." },
  { id: "m-music", name: "Music magic", kind: "Student magic", users: ["margarette"], arc: "exam", color: "#f48fb1", canon: "check",
    bio: "Margarette fights through the sound of her violin." },
  { id: "m-sword", name: "Sword magic", kind: "Divine Visionary cane", users: ["rayne"], arc: "s1", color: "#90caf9",
    bio: "The magic of the Sword Cane's holder, Rayne Ames." },
  { id: "m-sand", name: "Sand magic", kind: "Divine Visionary cane", users: ["orter"], arc: "s1", color: "#e0b26b",
    bio: "The Desert Cane's holder, Orter Madl, controls sand." },
  { id: "m-lights", name: "Lights", kind: "Divine Visionary cane", users: ["ryoh"], arc: "exam", color: "#fff6c2",
    bio: "Ryoh Grantz's light magic, which can also summon Hyperion." },
  { id: "m-flame", name: "Flame Cane magic", kind: "Divine Visionary cane", users: ["kaldo"], arc: "exam", color: "#ff7043",
    bio: "The magic of the Flame Cane's holder, Kaldo Gehenna." },
  { id: "m-dragon", name: "Dragon Cane magic", kind: "Divine Visionary cane", users: ["agito"], arc: "exam", color: "#81c784",
    bio: "The magic of the Dragon Cane's holder, Agito Tyrone." },
  { id: "m-ice", name: "Ice Cane magic", kind: "Divine Visionary cane", users: ["tsurara"], arc: "exam", color: "#b3e5fc",
    bio: "The magic of the Ice Cane's holder, Tsurara Halestone." },
  { id: "m-immortal", name: "Immortal Cane magic", kind: "Divine Visionary cane", users: ["renatus"], arc: "exam", color: "#ce93d8",
    bio: "The magic of the Immortal Cane's holder, Renatus Revol." },
  { id: "m-knowledge", name: "Knowledge Cane magic", kind: "Divine Visionary cane", users: ["sophina"], arc: "exam", color: "#a1887f",
    bio: "The magic of the Knowledge Cane's holder, Sophina Biblia." }
];

window.V.data.creatures = [
  { id: "hyperion", name: "Hyperion", kind: "Summon", users: ["ryoh"], arc: "exam", first: "Season 2", color: "#fff6c2",
    bio: "The being Ryoh Grantz summons with his Lights magic." }
];

window.V.data.orgs = [
  { id: "h-easton", name: "Easton Magic Academy", short: "Easton", kind: "School", lead: ["wahlberg"], color: "#5aa9ff",
    known: "Where Divine Visionaries are made",
    note: "The prestigious magic school Mash enrols in. Its best students can be chosen as Divine Visionary candidates." },
  { id: "h-adler", name: "Adler House", short: "Adler", kind: "House", color: "#f3d38a",
    known: "Mash's house", note: "The Easton house of Mash, Finn, Lance, Dot and Lemon." },
  { id: "h-orca", name: "Orca House", short: "Orca", kind: "House", color: "#f48fb1",
    known: "Margarette's house", note: "An Easton house. Margarette Macaron is one of its students." },
  { id: "h-visionaries", name: "Divine Visionaries", short: "Visionaries", kind: "Magic Bureau", color: "#f3d38a",
    known: "The eight canes", note: "The highest mages of the Magic Bureau. Each holds a cane named for their magic: Dragon, Flame, Desert, Sword, Immortal, Light, Knowledge and Ice." },
  { id: "h-magia-lupus", name: "Magia Lupus", short: "Lupus", kind: "Antagonist group", lead: ["abel"], color: "#9575cd",
    known: "Ranking people by talent", note: "A student group led by Abel Walker that believes the gifted should rule over the rest." },
  { id: "h-zero-family", name: "Innocent Zero's family", short: "Zero", kind: "Antagonist group", lead: ["innocent-zero"], color: "#ef5350",
    known: "Innocent Zero and his six sons", note: "Innocent Zero and the six sons he raised as weapons in his search for immortality." }
];

window.V.data.arcs = [
  { id: "pre", label: "Before Easton", short: "Mash's childhood", note: "Raised in secret in the forest." },
  { id: "s1", label: "Easton Magic Academy", short: "Season 1", note: "Mash enrols, makes friends and takes on Magia Lupus." },
  { id: "exam", label: "Divine Visionary Selection Exam", short: "Season 2", note: "The exam, the Divine Visionaries and Innocent Zero's sons." },
  { id: "tma", label: "Tri-Magic-Athalon", short: "Manga", sp: "m" },
  { id: "final", label: "Final battle", short: "Manga", sp: "m" }
];

window.V.data.links = [
  { a: "regro", b: "mash", t: "family", label: "Adoptive son", labelB: "Adoptive father" },
  { a: "rayne", b: "finn", t: "family", label: "Younger brother", labelB: "Elder brother" },
  { a: "lance", b: "anna", t: "family", label: "Younger sister", labelB: "Elder brother" },
  { a: "innocent-zero", b: "mash", t: "enemy", label: "Calls him his son", labelB: "Claims to be his father" },
  { a: "wahlberg", b: "mash", t: "mentor", label: "Student he protects", labelB: "Headmaster who believes in him" },
  { a: "mash", b: "finn", t: "bond", label: "Roommate and best friend", labelB: "Roommate and best friend" },
  { a: "mash", b: "lance", t: "bond", label: "Friend" },
  { a: "mash", b: "dot", t: "bond", label: "Friend" },
  { a: "mash", b: "lemon", t: "bond", label: "Self-declared fiancée", labelB: "The boy she loves" },
  { a: "finn", b: "lance", t: "bond", label: "Housemate" },
  { a: "finn", b: "dot", t: "bond", label: "Housemate" },
  { a: "lance", b: "dot", t: "rival", label: "Bickering rival" },
  { a: "mash", b: "abyss", t: "bond", label: "Friend", labelB: "The one who saw him as a person" },
  { a: "abel", b: "abyss", t: "ally", label: "Magia Lupus member", labelB: "Leader" },
  { a: "mash", b: "abel", t: "enemy", label: "Defeated him", labelB: "Defeated by" },
  { a: "rayne", b: "mash", t: "ally", label: "Comes to respect him" },
  { a: "orter", b: "mash", t: "rival", label: "Opposes a student without magic" },
  { a: "mash", b: "domina", t: "enemy", label: "Fought him", labelB: "Fought", canon: "check" },
  { a: "ryoh", b: "rayne", t: "ally", label: "Fellow Divine Visionary" },
  { a: "orter", b: "rayne", t: "ally", label: "Fellow Divine Visionary" }
];

window.V.data.timeline = [
  { id: "t-forest", arc: "pre", when: "Mash's childhood", kind: "event", title: "Found in the forest", ids: ["regro", "mash"],
    text: "Regro Burnedead takes in a baby born without magic and raises him in secret." },
  { id: "t-discovered", arc: "s1", when: "Season 1", kind: "event", title: "Discovered", ids: ["mash", "regro"],
    text: "The authorities find out Mash has no magic. To protect Regro, he sets out to become a Divine Visionary." },
  { id: "t-enrol", arc: "s1", when: "Season 1", kind: "event", title: "Entering Easton", ids: ["mash", "finn", "lemon", "wahlberg"],
    text: "Mash passes the entrance exam with muscle alone, saves Lemon and is placed in Adler House with Finn." },
  { id: "t-lupus", arc: "s1", when: "Season 1", kind: "battle", title: "Magia Lupus", ids: ["mash", "abel", "abyss"],
    text: "Mash takes on Magia Lupus, wins Abyss over and defeats its leader Abel Walker." },
  { id: "t-exam", arc: "exam", when: "Season 2", kind: "event", title: "The Divine Visionary Selection Exam", ids: ["mash", "lance", "dot", "finn", "margarette"],
    text: "Easton's best compete to become Divine Visionary candidates." },
  { id: "t-visionaries", arc: "exam", when: "Season 2", kind: "event", title: "The eight canes", ids: ["rayne", "orter", "ryoh", "kaldo", "agito", "tsurara", "renatus", "sophina"],
    text: "The Divine Visionaries gather. Not all of them accept a student without magic." },
  { id: "t-sons", arc: "exam", when: "Season 2", kind: "battle", title: "Innocent Zero's sons strike", ids: ["innocent-zero", "domina", "mash"],
    text: "Innocent Zero's sons move against Easton and Mash." },
  { id: "t-son", arc: "exam", when: "Season 2", kind: "reveal", title: "\"My son\"", ids: ["innocent-zero", "mash"],
    text: "Innocent Zero calls Mash his son." },
  { id: "t-tma", arc: "tma", when: "Manga", kind: "event", title: "Tri-Magic-Athalon", ids: ["mash"], sp: "m",
    text: "The Tri-Magic-Athalon arc follows the exam in the manga." },
  { id: "t-father", arc: "final", when: "Manga", kind: "reveal", title: "Father confirmed", ids: ["innocent-zero", "mash"], sp: "m",
    text: "Innocent Zero is confirmed as Mash's biological father." },
  { id: "t-final", arc: "final", when: "Manga", kind: "battle", title: "Mash against Innocent Zero", ids: ["mash", "innocent-zero", "wahlberg"], sp: "m",
    text: "The final battle against Innocent Zero." }
];
