/* Characters. side: Mash's side | Magic Bureau | Antagonist | Civilian.
   rank = standing (Divine Visionary, Easton faculty, Easton student).
   marks = number of magic-mark lines, only where confirmed (0 = none). */
window.V.data.characters = [
  {
    id: "mash", name: "Mash Burnedead", kind: "Easton student", role: "Adler House first-year with no magic",
    rank: "student", side: "Mash's side", orgs: ["h-easton", "h-adler"], parentsM: ["innocent-zero"], marks: 0, status: "Active", arc: "s1", first: "Season 1", featured: true, color: "#f3d38a",
    markNote: "Mash was born without magic, so he has no genuine magic mark: the line on his face does not mean what a mage's mark does. In a world where magic decides everything, that alone marks him for elimination.",
    bio: "A boy born without magic in a world where everyone has it. Raised in the forest by Regro Burnedead, he trained his body until his muscles could do what spells do. When the authorities discover him, he enrols at Easton Magic Academy and aims to become a Divine Visionary so that he and his father can live in peace. He loves cream puffs.",
    bioM: "Innocent Zero is confirmed to be his biological father.",
    abilities: [
      { n: "Superhuman strength", d: "Breaks spells, walls and wands with his bare hands." },
      { n: "Speed and reflexes", d: "Fast enough to keep up with mages flying on brooms." }
    ]
  },
  {
    id: "finn", name: "Finn Ames", kind: "Easton student", role: "Mash's roommate in Adler House",
    rank: "student", side: "Mash's side", orgs: ["h-easton", "h-adler"], status: "Active", arc: "s1", first: "Season 1", featured: true, color: "#9fd0ff",
    bio: "Mash's first friend and roommate at Easton. Timid and kind, he lives in the shadow of his elder brother Rayne, but he stands by Mash and grows braver."
  },
  {
    id: "lance", name: "Lance Crown", kind: "Easton student", role: "Adler House gravity mage",
    rank: "student", side: "Mash's side", orgs: ["h-easton", "h-adler"], marks: 2, status: "Active", arc: "s1", first: "Season 1", featured: true, color: "#c9a3ff", canon: "check",
    markNote: "Lance is listed here with two lines. This still needs checking against the source.",
    bio: "A gifted, cool-headed student who fights with gravity magic. He wants to become a Divine Visionary to save his younger sister Anna, and is devoted to her."
  },
  {
    id: "dot", name: "Dot Barrett", kind: "Easton student", role: "Adler House explosion mage",
    rank: "student", side: "Mash's side", orgs: ["h-easton", "h-adler"], status: "Active", arc: "s1", first: "Season 1", featured: true, color: "#ff8a65",
    bio: "A loud, hot-blooded Adler student who uses explosion magic and is jealous of anyone more popular with girls. He becomes one of Mash's closest friends."
  },
  {
    id: "lemon", name: "Lemon Irvine", kind: "Easton student", role: "Adler House first-year",
    rank: "student", side: "Mash's side", orgs: ["h-easton", "h-adler"], status: "Active", arc: "s1", first: "Season 1", featured: true, color: "#fff176",
    bio: "A first-year whom Mash saves on the day of the entrance exam. She declares herself his fiancée from then on."
  },
  {
    id: "rayne", name: "Rayne Ames", kind: "Divine Visionary", role: "Holder of the Sword Cane",
    rank: "dv", side: "Magic Bureau", cane: "Sword Cane", orgs: ["h-visionaries"], status: "Active", arc: "s1", first: "Season 1", featured: true, color: "#90caf9",
    bio: "Finn's elder brother and the youngest of the Divine Visionaries, holder of the Sword Cane. Cold on the surface, he comes to respect Mash."
  },
  {
    id: "orter", name: "Orter Madl", kind: "Divine Visionary", role: "Holder of the Desert Cane",
    rank: "dv", side: "Magic Bureau", cane: "Desert Cane", orgs: ["h-visionaries"], status: "Active", arc: "s1", first: "Season 1", color: "#e0b26b",
    bio: "A strict Divine Visionary who holds the Desert Cane and fights with sand. He believes in the order of the magic world and is hostile to anyone without magic."
  },
  {
    id: "ryoh", name: "Ryoh Grantz", kind: "Divine Visionary", role: "Holder of the Light Cane",
    rank: "dv", side: "Magic Bureau", cane: "Light Cane", orgs: ["h-visionaries"], status: "Active", arc: "exam", first: "Season 2", color: "#fff6c2",
    bio: "A Divine Visionary who holds the Light Cane. His magic is Lights, and he can summon Hyperion."
  },
  {
    id: "kaldo", name: "Kaldo Gehenna", kind: "Divine Visionary", role: "Holder of the Flame Cane",
    rank: "dv", side: "Magic Bureau", cane: "Flame Cane", orgs: ["h-visionaries"], status: "Active", arc: "exam", first: "Season 2", color: "#ff7043",
    bio: "A Divine Visionary who holds the Flame Cane."
  },
  {
    id: "agito", name: "Agito Tyrone", kind: "Divine Visionary", role: "Holder of the Dragon Cane",
    rank: "dv", side: "Magic Bureau", cane: "Dragon Cane", orgs: ["h-visionaries"], status: "Active", arc: "exam", first: "Season 2", color: "#81c784",
    bio: "A Divine Visionary who holds the Dragon Cane."
  },
  {
    id: "tsurara", name: "Tsurara Halestone", kind: "Divine Visionary", role: "Holder of the Ice Cane",
    rank: "dv", side: "Magic Bureau", cane: "Ice Cane", orgs: ["h-visionaries"], status: "Active", arc: "exam", first: "Season 2", color: "#b3e5fc",
    bio: "A Divine Visionary who holds the Ice Cane."
  },
  {
    id: "renatus", name: "Renatus Revol", kind: "Divine Visionary", role: "Holder of the Immortal Cane",
    rank: "dv", side: "Magic Bureau", cane: "Immortal Cane", orgs: ["h-visionaries"], status: "Active", arc: "exam", first: "Season 2", color: "#ce93d8",
    bio: "A Divine Visionary who holds the Immortal Cane."
  },
  {
    id: "sophina", name: "Sophina Biblia", kind: "Divine Visionary", role: "Holder of the Knowledge Cane",
    rank: "dv", side: "Magic Bureau", cane: "Knowledge Cane", orgs: ["h-visionaries"], status: "Active", arc: "exam", first: "Season 2", color: "#a1887f",
    bio: "A Divine Visionary who holds the Knowledge Cane."
  },
  {
    id: "wahlberg", name: "Wahlberg Baigan", kind: "Headmaster", role: "Headmaster of Easton",
    rank: "faculty", side: "Mash's side", orgs: ["h-easton"], marks: 3, status: "Active", arc: "s1", first: "Season 1", featured: true, color: "#d1c4e9",
    markNote: "One of the very few mages with three magic-mark lines.",
    bio: "Easton's headmaster, one of the most powerful mages alive and one of the very few with three magic-mark lines. He sees something in Mash and protects him from those who would expel him."
  },
  {
    id: "margarette", name: "Margarette Macaron", kind: "Easton student", role: "Orca House student",
    rank: "student", side: "Mash's side", orgs: ["h-easton", "h-orca"], status: "Active", arc: "exam", first: "Season 2", color: "#f48fb1", canon: "check",
    bio: "An Orca House student who fights with music, playing a violin in battle."
  },
  {
    id: "abel", name: "Abel Walker", kind: "Easton student", role: "Leader of Magia Lupus",
    rank: "student", side: "Antagonist", orgs: ["h-easton", "h-magia-lupus"], status: "Active", arc: "s1", first: "Season 1", featured: true, color: "#9575cd",
    bio: "The leader of Magia Lupus, a student who believes people should be ranked by their talent. He fights with doll magic. Mash defeats him."
  },
  {
    id: "abyss", name: "Abyss Razor", kind: "Easton student", role: "Magia Lupus member",
    rank: "student", side: "Mash's side", orgs: ["h-easton", "h-magia-lupus"], status: "Active", arc: "s1", first: "Season 1", color: "#7e57c2",
    bio: "A member of Magia Lupus with the Evil Eye, feared since childhood for it. After Mash treats him as a person, he comes over to Mash's side."
  },
  {
    id: "innocent-zero", name: "Innocent Zero", kind: "Mage", role: "The father who claims Mash",
    side: "Antagonist", orgs: ["h-zero-family"], marks: 3, status: "Active", arc: "exam", first: "Season 2", featured: true, color: "#ef5350",
    markNote: "Like Wahlberg, one of the very few mages with three magic-mark lines.",
    bio: "The most dangerous mage of the age, one of the very few with three magic-mark lines, who seeks immortality. He had six sons, whom he uses as his weapons. In the anime he calls Mash his son.",
    bioM: "The manga confirms he is Mash's biological father. He is the final enemy Mash has to beat."
  },
  {
    id: "domina", name: "Domina Bluesmith", kind: "Mage", role: "One of Innocent Zero's sons",
    side: "Antagonist", orgs: ["h-zero-family"], parents: ["innocent-zero"], status: "Active", arc: "exam", first: "Season 2", color: "#e57373", canon: "check",
    bio: "One of Innocent Zero's sons, who appears during the Divine Visionary Selection Exam and fights Mash."
  },
  {
    id: "regro", name: "Regro Burnedead", kind: "Civilian", role: "Mash's adoptive father",
    side: "Civilian", status: "Active", arc: "pre", first: "Season 1", color: "#bcaaa4",
    bio: "The old man who found the infant Mash in the forest and raised him in secret, knowing a child without magic would be eliminated."
  },
  {
    id: "anna", name: "Anna Crown", kind: "Civilian", role: "Lance's younger sister",
    side: "Civilian", status: "Active", arc: "s1", first: "Season 1", color: "#f8bbd0",
    bio: "Lance's beloved younger sister. Protecting her is why Lance wants to become a Divine Visionary."
  }
];
