// MongoDB queries for book collection operations

// 1. Find all books in a specific genre
db.books.find({ genre: "Fiction" })


// 2. Find books published after a certain year
db.books.find({ published_year: { $gt: 1945 } })


// 3. Find books by a specific author
db.books.find({ author: "Paulo Coelho" })


// 4. Update the price of a specific book
db.books.updateOne(
  { title: "The Alchemist" },
  { $set: { price: 15.99 } }
)


// 5. Delete a book by its title
db.books.deleteOne({ title: "The Great Gatsby" })


// ===== TASK 3: ADVANCED QUERIES =====

// 1. Find books that are both in stock and published after 2010
db.books.find({
  in_stock: true,
  published_year: { $gt: 2010 }
})


// 2. Using projection to return only title, author, and price fields
db.books.find(
  { genre: "Fiction" },
  { title: 1, author: 1, price: 1, _id: 0 }
)


// 3. Sorting by price - ASCENDING (lowest to highest)
db.books.find(
  {
    in_stock: true,
    published_year: { $gt: 1951 }
  },
  {
    title: 1,
    author: 1,
    price: 1,
    _id: 0
  }
).sort({ price: 1 })

// 3. Sorting by price - DESCENDING (highest to lowest)
db.books.find(
  {
    in_stock: true,
    published_year: { $gt: 1925 }
  },
  {
    title: 1,
    author: 1,
    price: 1,
    _id: 0
  }
).sort({ price: -1 })


// 4. PAGINATION - 5 books per page

// PAGE 1 (first 5 books)
db.books.find(
  {
    in_stock: true,
    published_year: { $gt: 1813 }
  },
  {
    title: 1,
    author: 1,
    price: 1,
    _id: 0
  }
)
.sort({ price: 1 })
.skip(0)
.limit(5)


// ===== TASK 4: AGGREGATION PIPELINE =====

// 1. Calculate the average price of books by genre
db.books.aggregate([
  {
    $group: {
      _id: "$genre",
      averagePrice: { $avg: "$price" },
      bookCount: { $sum: 1 }
    }
  },
  {
    $sort: { averagePrice: -1 }
  }
])


// 2. Find the author with the most books in the collection
db.books.aggregate([
  {
    $group: {
      _id: "$author",
      bookCount: { $sum: 1 },
      titles: { $push: "$title" }
    }
  },
  {
    $sort: { bookCount: -1 }
  },
  {
    $limit: 1
  }
])


// 3. Group books by publication decade and count them
db.books.aggregate([
  {
    $addFields: {
      decade: {
        $multiply: [
          { $floor: { $divide: ["$publishedYear", 10] } },
          10
        ]
      }
    }
  },
  {
    $group: {
      _id: "$decade",
      bookCount: { $sum: 1 },
      averagePrice: { $avg: "$price" },
      genres: { $addToSet: "$genre" }
    }
  },
  {
    $sort: { _id: 1 }
  },
  {
    $project: {
      decade: "$_id",
      bookCount: 1,
      averagePrice: { $round: ["$averagePrice", 2] },
      genreCount: { $size: "$genres" },
      genres: 1,
      _id: 0
    }
  }
])



//Task 5: Indexing
async function createIndexes(db) {
    console.log("\n=== CREATING INDEXES ===");
    const collection = db.collection('books');
    
    // 1. Create single field index on title
    console.log("\n1. Creating index on 'title' field...");
    const titleIndexResult = await collection.createIndex({ title: 1 });
    console.log(`Title index created: ${titleIndexResult}`)

    // 2. Create compound index on author and published_year
    console.log("\n2. Creating compound index on 'author' and 'published_year'...");
    const compoundIndexResult = await collection.createIndex({ 
        author: 1, 
        published_year: -1 
    });
    console.log(`Compound index created: ${compoundIndexResult}`);

    // 3. List all indexes
    console.log("\n3. Current indexes on the collection:");
    const indexes = await collection.listIndexes().toArray();
    indexes.forEach((index, i) => {
        console.log(`Index ${i + 1}: ${JSON.stringify(index.key)} (${index.name})`);
    });
}


