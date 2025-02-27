# Introduction to Mongoose ORM

Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It acts as a bridge between your Node.js application and MongoDB, providing a structured way to interact with the database.

## Why Use Mongoose?

- Simplifies MongoDB operations by abstracting raw queries.
- Provides a schema-based approach to define data models.
- Adds built-in validation, middleware, and query helpers.
- Supports promises and async/await for better code readability.

## Setting Up Mongoose in a Node.js Project

### Step 1: Install Mongoose

Run the following command in your Node.js project:

```bash
npm install mongoose
```

### Step 2: Connect to MongoDB

Use mongoose.connect() to establish a connection to your MongoDB instance (local or cloud-based like MongoDB Atlas).

```javascript
const mongoose = require('mongoose');

// Connection URI (replace with your MongoDB URI)
const uri = 'mongodb://localhost:27017/mydatabase';

// Connect to MongoDB
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));
```

Explanation:

- useNewUrlParser: Ensures compatibility with MongoDB’s new connection string parser.
- useUnifiedTopology: Uses the new server discovery and monitoring engine.

### Step 3: Handle Connection Events

Mongoose emits events that you can listen to for better control over the connection lifecycle.

```javascript
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from DB');
});
```

---

## Defining Schemas and Models

Mongoose uses schemas to define the structure of documents in a collection. A model is a compiled version of a schema that provides an interface to interact with the database.

### Step 1: Define a Schema

A schema defines the fields, data types, and validations for documents.

```javascript
const mongoose = require('mongoose');
// Define a schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 18 },
  createdAt: { type: Date, default: Date.now },
});
```

#### Common Schema Types:

- String, Number, Boolean, Date, Array, ObjectId (for references).

### Step 2: Create a Model

A model is a class that represents a MongoDB collection.

```javascript
const User = mongoose.model('User', userSchema);
```

The first argument ('User') is the singular name of the collection. Mongoose automatically pluralizes it (e.g., users).

---

### Benefits of Mongoose

#### a. Schema Definitions

- Enforces a structure on documents.
- Prevents invalid data from being saved to the database.

#### b. Validations

Mongoose provides built-in and custom validations to ensure data integrity.

```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Simple email regex
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
});
```

#### c. Middleware (Hooks)

Mongoose allows you to run functions before or after certain operations (e.g., save, remove).

```javascript
userSchema.pre('save', function (next) {
  console.log('Saving user:', this.name);
  next();
});

userSchema.post('save', function (doc, next) {
  console.log('User saved:', doc);
  next();
});
```

#### d. Query Helpers

Mongoose simplifies querying with methods like find(), findOne(), and where().

```javascript
User.find({ age: { $gte: 18 } }) // Find users aged 18 or older
  .then((users) => console.log(users))
  .catch((err) => console.error(err));
```

---

### 5. Setting Up a MongoDB Connection

Connecting to MongoDB Atlas
If you’re using MongoDB Atlas (cloud), replace the connection URI with your Atlas URI.

```javascript
const uri =
  'mongodb+srv://<username>:<password>@cluster0.mongodb.net/mydatabase?retryWrites=true&w=majority';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
```

- Replace <username> and <password> with your Atlas credentials.
  Connection Options
- useNewUrlParser: Ensures compatibility with MongoDB’s new connection string parser.
- useUnifiedTopology: Uses the new server discovery and monitoring engine.
- poolSize: Sets the maximum number of connections in the connection pool.

---

### 6. Example: Full Workflow

Here’s a complete example of connecting to MongoDB, defining a schema, and performing CRUD operations.

```javascript
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 18 },
});

// Create a model
const User = mongoose.model('User', userSchema);

// Create a new user
const newUser = new User({
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
});
newUser
  .save()
  .then((doc) => console.log('User saved:', doc))
  .catch((err) => console.error('Error saving user:', err));

// Find all users
User.find()
  .then((users) => console.log('Users:', users))
  .catch((err) => console.error('Error finding users:', err));
```

---

### 7. Best Practices

- Use Environment Variables: Store sensitive data like database URIs in .env files.
- Handle Errors Gracefully: Always catch errors in promises or use try/catch with async/await.
- Close Connections: Use mongoose.connection.close() to gracefully close the connection when the app shuts down.

---

you can effectively connect Node.js with MongoDB using Mongoose, define schemas, and perform database operations in a structured and efficient manner.

---

## Mongoose CRUD Operations

### Create: Saving Documents to Collections

Creating documents in MongoDB involves inserting new data into a collection. Mongoose provides several methods for this:

### a. Using Model.save()

This method is used to save an instance of a model (document) to the database.

```javascript
const User = mongoose.model('User', userSchema);

// Create a new user instance
const newUser = new User({
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
});

// Save the document
newUser
  .save()
  .then((doc) => console.log('User created:', doc))
  .catch((err) => console.error('Error creating user:', err));
```

#### Key Points:

- save() is asynchronous and returns a promise.
- It triggers Mongoose middleware (e.g., pre('save') and post('save')).

### b. Using Model.create()

This method is a shorthand for creating and saving one or more documents.

```javascript
User.create([
  { name: 'Bob', email: 'bob@example.com', age: 25 },
  { name: 'Charlie', email: 'charlie@example.com', age: 35 },
])
  .then((docs) => console.log('Users created:', docs))
  .catch((err) => console.error('Error creating users:', err));
```

#### Key Points:

- Can insert multiple documents at once.
- Automatically validates data against the schema.

---

### Read: Querying and Filtering Data

Reading data involves retrieving documents from a collection. Mongoose provides a rich API for querying and filtering.

#### a. Basic Queries

Find all documents:

```javascript
User.find()
.then(users => console.log('All users:', users))
.catch(err => console.error('Error finding users:', err));
Find documents matching a condition:
javascript

User.find({ age: { $gte: 30 } }) // Find users aged 30 or older
.then(users => console.log('Users aged 30+:', users))
.catch(err => console.error('Error finding users:', err));
```

#### b. Advanced Queries

Find a single document:

```javascript

User.findOne({ email: 'alice@example.com' })
.then(user => console.log('Found user:', user))
.catch(err => console.error('Error finding user:', err));
Find by ID:
javascript

User.findById('64f1b2c3e4b0a1b2c3d4e5f6')
.then(user => console.log('Found user by ID:', user))
.catch(err => console.error('Error finding user:', err));
```

Pagination and Sorting:

```javascript
User.find()
  .sort({ age: -1 }) // Sort by age in descending order
  .skip(10) // Skip the first 10 documents
  .limit(5) // Limit to 5 documents
  .then((users) => console.log('Paginated users:', users))
  .catch((err) => console.error('Error finding users:', err));
```

#### c. Query Helpers

Mongoose allows chaining query methods for more complex queries.

```javascript
User.find()
  .where('age')
  .gte(18) // Age >= 18
  .where('name')
  .equals('Alice') // Name = 'Alice'
  .select('name email') // Only return name and email fields
  .then((users) => console.log('Filtered users:', users))
  .catch((err) => console.error('Error finding users:', err));
```

---

### Update: Updating Specific Fields

Updating documents involves modifying existing data. Mongoose provides several methods for this.

#### a. Using Model.updateOne()

Updates the first document that matches the filter.

```javascript
User.updateOne(
  { email: 'alice@example.com' }, // Filter
  { $set: { age: 31 } } // Update
)
  .then((result) => console.log('Update result:', result))
  .catch((err) => console.error('Error updating user:', err));
```

#### Key Points:

- $set is used to update specific fields.
- Returns an object with the number of matched and modified documents.

#### b. Using Model.updateMany()

Updates all documents that match the filter.

```javascript
User.updateMany(
  { age: { $gte: 30 } }, // Filter
  { $inc: { age: 1 } } // Increment age by 1
)
  .then((result) => console.log('Update result:', result))
  .catch((err) => console.error('Error updating users:', err));
```

#### c. Using Model.findByIdAndUpdate()

Finds a document by ID and updates it.

```javascript
User.findByIdAndUpdate(
  '64f1b2c3e4b0a1b2c3d4e5f6', // Document ID
  { $set: { name: 'Alice Smith' } }, // Update
  { new: true } // Return the updated document
)
  .then((updatedUser) => console.log('Updated user:', updatedUser))
  .catch((err) => console.error('Error updating user:', err));
```

#### Key Points:

- { new: true } returns the updated document instead of the original.

---

### Delete: Removing Documents

Deleting documents involves removing data from a collection. Mongoose provides several methods for this.

#### a. Using Model.deleteOne()

Deletes the first document that matches the filter.

```javascript
User.deleteOne({ email: 'alice@example.com' })
  .then((result) => console.log('Delete result:', result))
  .catch((err) => console.error('Error deleting user:', err));
```

#### b. Using Model.deleteMany()

Deletes all documents that match the filter.

```javascript
User.deleteMany({ age: { $gte: 30 } })
  .then((result) => console.log('Delete result:', result))
  .catch((err) => console.error('Error deleting users:', err));
```

#### c. Using Model.findByIdAndDelete()

Finds a document by ID and deletes it.

```javascript
User.findByIdAndDelete('64f1b2c3e4b0a1b2c3d4e5f6')
  .then((deletedUser) => console.log('Deleted user:', deletedUser))
  .catch((err) => console.error('Error deleting user:', err));
```

---

### Advanced Techniques

#### a. Transactions

Mongoose supports MongoDB transactions for atomic operations.

```javascript

const session = await mongoose.startSession();
session.startTransaction();

try {
const user = await User.create([{ name: 'Dave', email: 'dave@example.com' }], { session });
await Profile.create([{ userId: user[0].\_id, bio: 'Hello, world!' }], { session });
await session.commitTransaction();
console.log('Transaction committed');
} catch (err) {
await session.abortTransaction();
console.error('Transaction aborted:', err);
} finally {
session.endSession();
}
```

#### b. Bulk Operations

Mongoose supports bulk operations for improved performance.

```javascript
const bulkOps = [
  { insertOne: { document: { name: 'Eve', email: 'eve@example.com' } } },
  { updateOne: { filter: { name: 'Alice' }, update: { $set: { age: 32 } } } },
];

User.bulkWrite(bulkOps)
  .then((result) => console.log('Bulk operation result:', result))
  .catch((err) => console.error('Error performing bulk operation:', err));
```

---

#### Best Practices

- Use lean() for Read-Only Queries: Improves performance by returning plain JavaScript objects instead of Mongoose documents.

```javascript
User.find()
  .lean()
  .then((users) => console.log('Lean users:', users));
```

- Validate Input: Always validate data before performing CRUD operations.
- Handle Errors Gracefully: Use try/catch or .catch() to handle errors in asynchronous operations.

---

---

### Types of Relationships

In MongoDB, relationships can be categorized into three main types:

#### One-to-One: A single document in one collection is related to a single document in another collection.

- Example: A User has one Profile.

#### One-to-Many: A single document in one collection is related to multiple documents in another collection.

- Example: A User has many Posts.

#### Many-to-Many: Multiple documents in one collection are related to multiple documents in another collection.

- Example: A Student can enroll in many Courses, and a Course can have many Students.

---

### Modeling Relationships in MongoDB

MongoDB provides two primary ways to model relationships:

- Embedding: Storing related data within a single document.
- Referencing: Storing references (IDs) to related documents in separate collections.

---

### Embedding Documents

Embedding is suitable when the related data is tightly coupled and frequently accessed together.
Example: One-to-One Relationship
A User document embeds a Profile document.

```javascript
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  profile: {
    bio: String,
    website: String,
  },
});

const User = mongoose.model('User', userSchema);

// Create a user with an embedded profile
const newUser = new User({
  name: 'Alice',
  email: 'alice@example.com',
  profile: {
    bio: 'Software Engineer',
    website: 'https://alice.com',
  },
});

newUser
  .save()
  .then((doc) => console.log('User created:', doc))
  .catch((err) => console.error('Error creating user:', err));
```

#### Advantages:

- Fast read operations (no joins needed).
- Atomic updates within a single document.

#### Disadvantages:

- Documents can grow large, impacting performance.
- Not ideal for frequently changing or unbounded relationships.

---

### Referencing Documents

Referencing is suitable when the related data is loosely coupled or when the relationship is large or unbounded.
Example: One-to-Many Relationship
A User document references multiple Post documents.

```javascript
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

// Create a user and posts
const newUser = new User({ name: 'Bob', email: 'bob@example.com' });
const post1 = new Post({ title: 'First Post', content: 'Hello, world!' });
const post2 = new Post({
  title: 'Second Post',
  content: 'MongoDB is awesome!',
});

// Save posts and associate them with the user
Promise.all([post1.save(), post2.save()])
  .then(([p1, p2]) => {
    newUser.posts = [p1._id, p2._id];
    return newUser.save();
  })
  .then((doc) => console.log('User created with posts:', doc))
  .catch((err) => console.error('Error creating user:', err));
```

#### Advantages:

- Documents remain small and manageable.
- Suitable for large or unbounded relationships.

#### Disadvantages:

- Requires additional queries to fetch related data.

---

### Implementing Population in Mongoose

Population is a Mongoose feature that replaces references with the actual documents from another collection.
Example: Populating Posts for a User

```javascript
User.findById('64f1b2c3e4b0a1b2c3d4e5f6')
  .populate('posts') // Replace post IDs with actual post documents
  .then((user) => console.log('User with populated posts:', user))
  .catch((err) => console.error('Error finding user:', err));
```

#### Key Points:

- populate() works with referenced fields.
- You can specify which fields to populate or exclude:
  .populate('posts', 'title') // Only populate the 'title' field of posts

---

#### Many-to-Many Relationships

Many-to-Many relationships are modeled using an array of references in both collections.
Example: Students and Courses

```javascript

const studentSchema = new mongoose.Schema({
name: String,
courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

const courseSchema = new mongoose.Schema({
title: String,
students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);

// Create students and courses
const student1 = new Student({ name: 'Alice' });
const student2 = new Student({ name: 'Bob' });
const course1 = new Course({ title: 'Math' });
const course2 = new Course({ title: 'Science' });

// Associate students with courses
student1.courses.push(course1.\_id, course2.\_id);
student2.courses.push(course1.\_id);
course1.students.push(student1.\_id, student2.\_id);
course2.students.push(student1.\_id);

// Save all documents
Promise.all([student1.save(), student2.save(), course1.save(), course2.save()])
.then(() => console.log('Students and courses saved'))
.catch(err => console.error('Error saving documents:', err));
```

#### Querying Many-to-Many Relationships:

Use populate() to fetch related documents.

```javascript

Student.findById(student1.\_id)
.populate('courses')
.then(student => console.log('Student with courses:', student))
.catch(err => console.error('Error finding student:', err));
```

---

#### Best Practices for Handling Relationships

- Choose the Right Approach:
  - Use embedding for tightly coupled, small, and frequently accessed data.
  - Use referencing for loosely coupled, large, or unbounded relationships.
  - Use Indexes:
    - Index referenced fields (e.g., posts in User) to improve query performance.
  - Avoid Deep Nesting:
    - Deeply nested documents can become difficult to manage and query.
  - Use Population Wisely:
    - Avoid overusing populate() as it can lead to performance issues with large datasets.
  - Consider Denormalization:
    - For read-heavy applications, consider duplicating data to avoid joins.

---

#### Example: Full Workflow

Here’s a complete example of handling relationships in MongoDB using Mongoose:

```javascript

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

// Define schemas
const profileSchema = new mongoose.Schema({
bio: String,
website: String
});

const userSchema = new mongoose.Schema({
name: String,
email: String,
profile: profileSchema, // Embedded document
posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }] // Referenced documents
});

const postSchema = new mongoose.Schema({
title: String,
content: String
});

// Create models
const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

// Create and save documents
const newUser = new User({
name: 'Alice',
email: 'alice@example.com',
profile: {
bio: 'Software Engineer',
website: 'https://alice.com'
}
});

const post1 = new Post({ title: 'First Post', content: 'Hello, world!' });
const post2 = new Post({ title: 'Second Post', content: 'MongoDB is awesome!' });

Promise.all([post1.save(), post2.save()])
.then(([p1, p2]) => {
newUser.posts = [p1._id, p2._id];
return newUser.save();
})
.then(doc => {
console.log('User created with embedded profile and referenced posts:', doc);
return User.findById(doc.\_id).populate('posts');
})
.then(user => console.log('User with populated posts:', user))
.catch(err => console.error('Error:', err));
```
