// =====================================================================
// acervo-inicial.js: 50 livros famosos (25 brasileiros + 25 do mundo)
//
// Eles são adicionados automaticamente na PRIMEIRA vez que o sistema
// é aberto num navegador, para não precisar cadastrar tudo à mão.
// =====================================================================

const ACERVO_INICIAL = [
  // ---------- Brasil ----------
  { titulo: "Dom Casmurro", autor: "Machado de Assis", genero: "Romance", ano: 1899 },
  { titulo: "Memórias Póstumas de Brás Cubas", autor: "Machado de Assis", genero: "Romance", ano: 1881 },
  { titulo: "O Alienista", autor: "Machado de Assis", genero: "Romance", ano: 1882 },
  { titulo: "Grande Sertão: Veredas", autor: "João Guimarães Rosa", genero: "Romance", ano: 1956 },
  { titulo: "Vidas Secas", autor: "Graciliano Ramos", genero: "Romance", ano: 1938 },
  { titulo: "O Cortiço", autor: "Aluísio Azevedo", genero: "Romance", ano: 1890 },
  { titulo: "Iracema", autor: "José de Alencar", genero: "Romance", ano: 1865 },
  { titulo: "Macunaíma", autor: "Mário de Andrade", genero: "Aventura", ano: 1928 },
  { titulo: "A Hora da Estrela", autor: "Clarice Lispector", genero: "Romance", ano: 1977 },
  { titulo: "Capitães da Areia", autor: "Jorge Amado", genero: "Romance", ano: 1937 },
  { titulo: "Gabriela, Cravo e Canela", autor: "Jorge Amado", genero: "Romance", ano: 1958 },
  { titulo: "O Quinze", autor: "Rachel de Queiroz", genero: "Romance", ano: 1930 },
  { titulo: "Triste Fim de Policarpo Quaresma", autor: "Lima Barreto", genero: "Romance", ano: 1915 },
  { titulo: "Torto Arado", autor: "Itamar Vieira Junior", genero: "Romance", ano: 2019 },
  { titulo: "Quarto de Despejo", autor: "Carolina Maria de Jesus", genero: "Biografia", ano: 1960 },
  { titulo: "Olga", autor: "Fernando Morais", genero: "Biografia", ano: 1985 },
  { titulo: "Auto da Compadecida", autor: "Ariano Suassuna", genero: "Outro", ano: 1955 },
  { titulo: "Morte e Vida Severina", autor: "João Cabral de Melo Neto", genero: "Poesia", ano: 1955 },
  { titulo: "Sentimento do Mundo", autor: "Carlos Drummond de Andrade", genero: "Poesia", ano: 1940 },
  { titulo: "O Alquimista", autor: "Paulo Coelho", genero: "Fantasia", ano: 1988 },
  { titulo: "O Xangô de Baker Street", autor: "Jô Soares", genero: "Suspense", ano: 1995 },
  { titulo: "Reinações de Narizinho", autor: "Monteiro Lobato", genero: "Infantojuvenil", ano: 1931 },
  { titulo: "Meu Pé de Laranja Lima", autor: "José Mauro de Vasconcelos", genero: "Infantojuvenil", ano: 1968 },
  { titulo: "O Menino Maluquinho", autor: "Ziraldo", genero: "Infantojuvenil", ano: 1980 },
  { titulo: "Pedagogia da Autonomia", autor: "Paulo Freire", genero: "Didático", ano: 1996 },

  // ---------- Mundo ----------
  { titulo: "1984", autor: "George Orwell", genero: "Ficção científica", ano: 1949 },
  { titulo: "A Revolução dos Bichos", autor: "George Orwell", genero: "Outro", ano: 1945 },
  { titulo: "Admirável Mundo Novo", autor: "Aldous Huxley", genero: "Ficção científica", ano: 1932 },
  { titulo: "Fahrenheit 451", autor: "Ray Bradbury", genero: "Ficção científica", ano: 1953 },
  { titulo: "Duna", autor: "Frank Herbert", genero: "Ficção científica", ano: 1965 },
  { titulo: "O Hobbit", autor: "J.R.R. Tolkien", genero: "Fantasia", ano: 1937 },
  { titulo: "O Senhor dos Anéis: A Sociedade do Anel", autor: "J.R.R. Tolkien", genero: "Fantasia", ano: 1954 },
  { titulo: "Harry Potter e a Pedra Filosofal", autor: "J.K. Rowling", genero: "Fantasia", ano: 1997 },
  { titulo: "O Leão, a Feiticeira e o Guarda-Roupa", autor: "C.S. Lewis", genero: "Fantasia", ano: 1950 },
  { titulo: "O Pequeno Príncipe", autor: "Antoine de Saint-Exupéry", genero: "Infantojuvenil", ano: 1943 },
  { titulo: "Dom Quixote", autor: "Miguel de Cervantes", genero: "Aventura", ano: 1605 },
  { titulo: "A Volta ao Mundo em 80 Dias", autor: "Júlio Verne", genero: "Aventura", ano: 1873 },
  { titulo: "Cem Anos de Solidão", autor: "Gabriel García Márquez", genero: "Romance", ano: 1967 },
  { titulo: "Orgulho e Preconceito", autor: "Jane Austen", genero: "Romance", ano: 1813 },
  { titulo: "Crime e Castigo", autor: "Fiódor Dostoiévski", genero: "Romance", ano: 1866 },
  { titulo: "Romeu e Julieta", autor: "William Shakespeare", genero: "Outro", ano: 1597 },
  { titulo: "Frankenstein", autor: "Mary Shelley", genero: "Terror", ano: 1818 },
  { titulo: "Drácula", autor: "Bram Stoker", genero: "Terror", ano: 1897 },
  { titulo: "O Iluminado", autor: "Stephen King", genero: "Terror", ano: 1977 },
  { titulo: "Assassinato no Expresso do Oriente", autor: "Agatha Christie", genero: "Suspense", ano: 1934 },
  { titulo: "E Não Sobrou Nenhum", autor: "Agatha Christie", genero: "Suspense", ano: 1939 },
  { titulo: "O Código Da Vinci", autor: "Dan Brown", genero: "Suspense", ano: 2003 },
  { titulo: "O Diário de Anne Frank", autor: "Anne Frank", genero: "Biografia", ano: 1947 },
  { titulo: "Steve Jobs", autor: "Walter Isaacson", genero: "Biografia", ano: 2011 },
  { titulo: "Sapiens: Uma Breve História da Humanidade", autor: "Yuval Noah Harari", genero: "Didático", ano: 2011 },
];
