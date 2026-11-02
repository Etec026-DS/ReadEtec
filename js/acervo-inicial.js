// =====================================================================
// acervo-inicial.js: 50 livros famosos (25 brasileiros + 25 do mundo)
//
// Eles são adicionados automaticamente na PRIMEIRA vez que o sistema
// é aberto num navegador, para não precisar cadastrar tudo à mão.
// "exemplares" = quantas cópias físicas do livro a biblioteca tem.
// =====================================================================

const ACERVO_INICIAL = [
  // ---------- Brasil ----------
  { titulo: "Dom Casmurro", autor: "Machado de Assis", genero: "Romance", ano: 1899, exemplares: 5 },
  { titulo: "Memórias Póstumas de Brás Cubas", autor: "Machado de Assis", genero: "Romance", ano: 1881, exemplares: 4 },
  { titulo: "O Alienista", autor: "Machado de Assis", genero: "Romance", ano: 1882, exemplares: 3 },
  { titulo: "Grande Sertão: Veredas", autor: "João Guimarães Rosa", genero: "Romance", ano: 1956, exemplares: 2 },
  { titulo: "Vidas Secas", autor: "Graciliano Ramos", genero: "Romance", ano: 1938, exemplares: 4 },
  { titulo: "O Cortiço", autor: "Aluísio Azevedo", genero: "Romance", ano: 1890, exemplares: 3 },
  { titulo: "Iracema", autor: "José de Alencar", genero: "Romance", ano: 1865, exemplares: 2 },
  { titulo: "Macunaíma", autor: "Mário de Andrade", genero: "Aventura", ano: 1928, exemplares: 2 },
  { titulo: "A Hora da Estrela", autor: "Clarice Lispector", genero: "Romance", ano: 1977, exemplares: 3 },
  { titulo: "Capitães da Areia", autor: "Jorge Amado", genero: "Romance", ano: 1937, exemplares: 4 },
  { titulo: "Gabriela, Cravo e Canela", autor: "Jorge Amado", genero: "Romance", ano: 1958, exemplares: 2 },
  { titulo: "O Quinze", autor: "Rachel de Queiroz", genero: "Romance", ano: 1930, exemplares: 3 },
  { titulo: "Triste Fim de Policarpo Quaresma", autor: "Lima Barreto", genero: "Romance", ano: 1915, exemplares: 2 },
  { titulo: "Torto Arado", autor: "Itamar Vieira Junior", genero: "Romance", ano: 2019, exemplares: 3 },
  { titulo: "Quarto de Despejo", autor: "Carolina Maria de Jesus", genero: "Biografia", ano: 1960, exemplares: 3 },
  { titulo: "Olga", autor: "Fernando Morais", genero: "Biografia", ano: 1985, exemplares: 1 },
  { titulo: "Auto da Compadecida", autor: "Ariano Suassuna", genero: "Outro", ano: 1955, exemplares: 3 },
  { titulo: "Morte e Vida Severina", autor: "João Cabral de Melo Neto", genero: "Poesia", ano: 1955, exemplares: 3 },
  { titulo: "Sentimento do Mundo", autor: "Carlos Drummond de Andrade", genero: "Poesia", ano: 1940, exemplares: 1 },
  { titulo: "O Alquimista", autor: "Paulo Coelho", genero: "Fantasia", ano: 1988, exemplares: 2 },
  { titulo: "O Xangô de Baker Street", autor: "Jô Soares", genero: "Suspense", ano: 1995, exemplares: 1 },
  { titulo: "Reinações de Narizinho", autor: "Monteiro Lobato", genero: "Infantojuvenil", ano: 1931, exemplares: 2 },
  { titulo: "Meu Pé de Laranja Lima", autor: "José Mauro de Vasconcelos", genero: "Infantojuvenil", ano: 1968, exemplares: 3 },
  { titulo: "O Menino Maluquinho", autor: "Ziraldo", genero: "Infantojuvenil", ano: 1980, exemplares: 4 },
  { titulo: "Pedagogia da Autonomia", autor: "Paulo Freire", genero: "Didático", ano: 1996, exemplares: 1 },

  // ---------- Mundo ----------
  { titulo: "1984", autor: "George Orwell", genero: "Ficção científica", ano: 1949, exemplares: 3 },
  { titulo: "A Revolução dos Bichos", autor: "George Orwell", genero: "Outro", ano: 1945, exemplares: 3 },
  { titulo: "Admirável Mundo Novo", autor: "Aldous Huxley", genero: "Ficção científica", ano: 1932, exemplares: 2 },
  { titulo: "Fahrenheit 451", autor: "Ray Bradbury", genero: "Ficção científica", ano: 1953, exemplares: 2 },
  { titulo: "Duna", autor: "Frank Herbert", genero: "Ficção científica", ano: 1965, exemplares: 2 },
  { titulo: "O Hobbit", autor: "J.R.R. Tolkien", genero: "Fantasia", ano: 1937, exemplares: 3 },
  { titulo: "O Senhor dos Anéis: A Sociedade do Anel", autor: "J.R.R. Tolkien", genero: "Fantasia", ano: 1954, exemplares: 2 },
  { titulo: "Harry Potter e a Pedra Filosofal", autor: "J.K. Rowling", genero: "Fantasia", ano: 1997, exemplares: 5 },
  { titulo: "O Leão, a Feiticeira e o Guarda-Roupa", autor: "C.S. Lewis", genero: "Fantasia", ano: 1950, exemplares: 2 },
  { titulo: "O Pequeno Príncipe", autor: "Antoine de Saint-Exupéry", genero: "Infantojuvenil", ano: 1943, exemplares: 4 },
  { titulo: "Dom Quixote", autor: "Miguel de Cervantes", genero: "Aventura", ano: 1605, exemplares: 1 },
  { titulo: "A Volta ao Mundo em 80 Dias", autor: "Júlio Verne", genero: "Aventura", ano: 1873, exemplares: 2 },
  { titulo: "Cem Anos de Solidão", autor: "Gabriel García Márquez", genero: "Romance", ano: 1967, exemplares: 2 },
  { titulo: "Orgulho e Preconceito", autor: "Jane Austen", genero: "Romance", ano: 1813, exemplares: 3 },
  { titulo: "Crime e Castigo", autor: "Fiódor Dostoiévski", genero: "Romance", ano: 1866, exemplares: 2 },
  { titulo: "Romeu e Julieta", autor: "William Shakespeare", genero: "Outro", ano: 1597, exemplares: 3 },
  { titulo: "Frankenstein", autor: "Mary Shelley", genero: "Terror", ano: 1818, exemplares: 2 },
  { titulo: "Drácula", autor: "Bram Stoker", genero: "Terror", ano: 1897, exemplares: 2 },
  { titulo: "O Iluminado", autor: "Stephen King", genero: "Terror", ano: 1977, exemplares: 2 },
  { titulo: "Assassinato no Expresso do Oriente", autor: "Agatha Christie", genero: "Suspense", ano: 1934, exemplares: 2 },
  { titulo: "E Não Sobrou Nenhum", autor: "Agatha Christie", genero: "Suspense", ano: 1939, exemplares: 3 },
  { titulo: "O Código Da Vinci", autor: "Dan Brown", genero: "Suspense", ano: 2003, exemplares: 2 },
  { titulo: "O Diário de Anne Frank", autor: "Anne Frank", genero: "Biografia", ano: 1947, exemplares: 3 },
  { titulo: "Steve Jobs", autor: "Walter Isaacson", genero: "Biografia", ano: 2011, exemplares: 1 },
  { titulo: "Sapiens: Uma Breve História da Humanidade", autor: "Yuval Noah Harari", genero: "Didático", ano: 2011, exemplares: 2 },
];
