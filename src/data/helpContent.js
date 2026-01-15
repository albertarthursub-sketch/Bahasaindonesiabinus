// Help Content Database - Q&A format for teacher documentation
export const helpContent = {
  faqs: [
    // ===== CREATING CLASSES =====
    {
      id: 'create-class-1',
      category: 'Creating Classes',
      question: 'How do I create a new class?',
      answer: `
1. Click the "Create New Class" button on the Classes page
2. Enter the class name (e.g., "Grade 3A - Indonesian Basics")
3. Click "Create Class"
4. Your class is now created and you can start adding students!

Note: Each class has a unique Class ID that you can share with students.
      `
    },
    {
      id: 'create-class-2',
      category: 'Creating Classes',
      question: 'What is a Class ID and how do I use it?',
      answer: `
The Class ID is a unique identifier for your class. Students use it to join your class:

1. Go to your class details
2. Copy the Class ID (shown in the class information panel)
3. Share this ID with your students
4. Students enter this ID when logging in to join your class

The Class ID is permanent and unique to your class.
      `
    },
    {
      id: 'create-class-3',
      category: 'Creating Classes',
      question: 'Can I edit or delete a class?',
      answer: `
Yes! Here's how:

**Edit Class:**
1. Go to the class you want to edit
2. Click the "Edit" button
3. Update the class name or other details
4. Save changes

**Delete Class:**
1. Go to the class you want to delete
2. Click the "Delete" button
3. Confirm deletion
⚠️ Warning: This will remove all assignments for this class. Student data will be archived.
      `
    },
    {
      id: 'create-class-4',
      category: 'Creating Classes',
      question: 'How many students can I add to a class?',
      answer: `
There's no limit to the number of students you can add to a class! You can:
- Manually add students one by one
- Import students from a CSV file (recommended for large groups)
- Have students self-register using the Class ID

We recommend importing from CSV for 10+ students for faster setup.
      `
    },

    // ===== IMPORTING STUDENTS =====
    {
      id: 'import-students-1',
      category: 'Importing Students',
      question: 'How do I import students into my class?',
      answer: `
**Method 1: CSV Import (Recommended)**
1. Go to your class
2. Click "Import Students"
3. Download the CSV template
4. Fill in student names and avatars (emoji)
5. Upload the file
6. Review and confirm import

**Method 2: Manual Add**
1. Click "Add Student" button
2. Enter name and select an emoji avatar
3. Click "Add"

**CSV Format:**
- Column 1: Student Name (e.g., "Budi")
- Column 2: Avatar (emoji, e.g., "🦁" or "🐸")
      `
    },
    {
      id: 'import-students-2',
      category: 'Importing Students',
      question: 'What\'s the fastest way to add many students?',
      answer: `
Use the CSV import feature! It's the fastest way:

1. Prepare an Excel file with student names and avatars
2. Go to Class Management
3. Click "Import Students"
4. Download the template
5. Fill it with your student data
6. Upload and confirm

You can import up to 100 students at once. This saves time compared to manual entry!
      `
    },
    {
      id: 'import-students-3',
      category: 'Importing Students',
      question: 'Can students join a class themselves?',
      answer: `
Yes! Students can self-register:

1. Give students your Class ID
2. Students go to the login page
3. Click "Join Class"
4. Enter the Class ID
5. Enter their name and choose an avatar
6. They're automatically added to your class!

This is a great way to let students set up their own accounts.
      `
    },
    {
      id: 'import-students-4',
      category: 'Importing Students',
      question: 'How do I remove a student from my class?',
      answer: `
1. Go to your class
2. Find the student in the student list
3. Click the "Remove" or "Delete" button next to their name
4. Confirm removal

⚠️ Note: The student account remains in the system but will no longer appear in your class. Their learning history is preserved.
      `
    },

    // ===== CREATING VOCABULARY LISTS =====
    {
      id: 'vocab-1',
      category: 'Creating Vocabulary Lists',
      question: 'How do I create a vocabulary list?',
      answer: `
1. Go to the "Vocabulary Lists" section
2. Click "Create New List"
3. Enter list details:
   - Title (e.g., "Animals")
   - Description (e.g., "Learn names of animals in Indonesian")
   - Mode: Choose "syllable-building" or "image-vocabulary"
4. Add words (manually or import from CSV)
5. Click "Save"

Your vocabulary list is now created and ready to assign to classes!
      `
    },
    {
      id: 'vocab-2',
      category: 'Creating Vocabulary Lists',
      question: 'What are the two learning modes?',
      answer: `
**Syllable-Building Mode:**
- Students drag and drop syllables to form words
- Great for learning word structure
- Perfect for Indonesian words with complex syllables

**Image-Vocabulary Mode:**
- Students see images and match them to words
- Best for visual learners
- Great for concrete nouns (animals, objects, foods)

Choose the mode that best fits your teaching goals!
      `
    },
    {
      id: 'vocab-3',
      category: 'Creating Vocabulary Lists',
      question: 'How do I add words to a vocabulary list?',
      answer: `
**Method 1: Manual Entry**
1. Click "Add Word"
2. Enter:
   - Indonesian word
   - English translation
   - Syllables (separated by hyphens, e.g., "ku-cing")
   - Optional: Image URL or upload image
   - Optional: Audio file (your pronunciation)
3. Click "Save Word"

**Method 2: CSV Import**
1. Click "Import Words"
2. Download the template
3. Fill with your words
4. Upload the file

CSV Format: Indonesian | English | Syllables | ImageURL | AudioURL
      `
    },
    {
      id: 'vocab-4',
      category: 'Creating Vocabulary Lists',
      question: 'Can I use AI to generate vocabulary lists?',
      answer: `
Yes! We have an AI vocabulary generator:

1. Go to "Create New List"
2. Click "Generate with AI"
3. Enter:
   - Topic (e.g., "Fruits")
   - Number of words
   - Difficulty level (Beginner, Intermediate, Advanced)
4. Click "Generate"
5. Review the AI-generated list
6. Edit any words if needed
7. Save the list

The AI will generate authentic Indonesian vocabulary with translations and images!
      `
    },
    {
      id: 'vocab-5',
      category: 'Creating Vocabulary Lists',
      question: 'How do I add images to vocabulary words?',
      answer: `
**Option 1: Upload Image**
1. Click "Add Word"
2. Click "Upload Image" button
3. Choose image file from your computer
4. The image is uploaded automatically

**Option 2: Paste Image URL**
1. Click "Add Word"
2. Paste the image URL in the Image URL field
3. The image will display when saved

**Option 3: AI Generate Image**
If you use AI vocabulary generation, images are created automatically!

Supported formats: JPG, PNG, GIF, WebP
      `
    },

    // ===== CREATING SPO ACTIVITIES =====
    {
      id: 'spo-1',
      category: 'Creating SPO Activities',
      question: 'What is an SPO Activity?',
      answer: `
SPO stands for "Subject-Predicate-Object" - a core grammar concept in Indonesian.

An SPO Activity teaches students to:
- Identify sentence structure
- Arrange scrambled words into correct sentences
- Understand subject, predicate, and object relationships

Example: "Anak (subject) membaca (predicate) buku (object)" = "The child reads a book"
      `
    },
    {
      id: 'spo-2',
      category: 'Creating SPO Activities',
      question: 'How do I create an SPO Activity?',
      answer: `
1. Go to "SPO Activities" section
2. Click "Create New Activity"
3. Enter activity details:
   - Title (e.g., "SPO Basics - Lesson 1")
   - Description
   - Difficulty Level (Beginner, Intermediate, Advanced)
4. Add questions by clicking "Add Question"
5. For each question, enter:
   - The complete sentence in Indonesian
   - Subject
   - Predicate
   - Object
6. Click "Save Activity"

Your SPO Activity is ready to assign to classes!
      `
    },
    {
      id: 'spo-3',
      category: 'Creating SPO Activities',
      question: 'How does the SPO Practice work for students?',
      answer: `
When students do an SPO Activity:

1. They see a scrambled sentence (words are mixed up)
2. They must click words in the correct order to build the sentence
3. They click "Check Answer" to verify
4. If correct: They see a celebration screen and move to the next sentence
5. If incorrect: They see encouraging feedback and can try again

The activity tests their understanding of word order and sentence structure!
      `
    },
    {
      id: 'spo-4',
      category: 'Creating SPO Activities',
      question: 'Can I import SPO questions from a file?',
      answer: `
Yes! Use CSV import:

1. Go to "Create SPO Activity"
2. Click "Import Questions"
3. Download the CSV template
4. Fill with your questions in format:
   - Column 1: Complete sentence
   - Column 2: Subject
   - Column 3: Predicate
   - Column 4: Object
5. Upload the file
6. Review and save

This is great for adding many questions at once!
      `
    },

    // ===== ASSIGNING ACTIVITIES =====
    {
      id: 'assign-1',
      category: 'Assigning Activities',
      question: 'How do I assign a vocabulary list to a class?',
      answer: `
1. Go to your class
2. Click "Assign Activity" or "Add Learning Material"
3. Select "Vocabulary List"
4. Choose the vocabulary list you want to assign
5. Click "Assign to Class"
6. Select which students should have this (all or specific students)
7. Confirm

All assigned students will now see this vocabulary list in their dashboard!
      `
    },
    {
      id: 'assign-2',
      category: 'Assigning Activities',
      question: 'How do I assign an SPO Activity to a class?',
      answer: `
1. Go to your class
2. Click "Assign Activity"
3. Select "SPO Activity" or "Writing Practice"
4. Choose the SPO Activity
5. Click "Assign to Class"
6. Choose target students (all or specific)
7. Confirm

Students can start the SPO practice immediately!
      `
    },
    {
      id: 'assign-3',
      category: 'Assigning Activities',
      question: 'Can I assign activities to specific students only?',
      answer: `
Yes! When assigning an activity:

1. Click "Assign Activity"
2. Select the activity
3. You'll see "Select Students"
4. Choose "All Students" or "Specific Students"
5. If specific: Check the boxes for students you want
6. Click "Assign"

This lets you differentiate activities by student level!
      `
    },
    {
      id: 'assign-4',
      category: 'Assigning Activities',
      question: 'Can I remove an assignment?',
      answer: `
Yes, you can unassign activities:

1. Go to your class
2. Find the assignment in the "Assignments" section
3. Click the "Remove" or "Unassign" button
4. Confirm removal

⚠️ Note: Student progress on that activity will be preserved for your records.
      `
    },

    // ===== VIEWING PROGRESS & ANALYTICS =====
    {
      id: 'analytics-1',
      category: 'Viewing Student Progress/Analytics',
      question: 'How do I see student progress on activities?',
      answer: `
1. Go to your class
2. Click "View Analytics" or "Progress Reports"
3. You'll see:
   - Overall class statistics
   - Individual student performance
   - Completion rates
   - Average scores

Click on a student to see detailed progress on each activity!
      `
    },
    {
      id: 'analytics-2',
      category: 'Viewing Student Progress/Analytics',
      question: 'What information can I see about a student\'s learning?',
      answer: `
For each student, you can see:

**Overall Stats:**
- Total words learned
- Total stars earned
- Completion rate
- Time spent learning

**Per Activity:**
- Which activities they've started/completed
- Their score/accuracy
- Time spent on each activity
- Detailed attempt history

**Performance Trends:**
- Learning progress over time
- Most challenging words
- Best performance areas
      `
    },
    {
      id: 'analytics-3',
      category: 'Viewing Student Progress/Analytics',
      question: 'Can I export student progress reports?',
      answer: `
Yes! Generate downloadable reports:

1. Go to "Analytics"
2. Select students or entire class
3. Click "Generate Report"
4. Choose format: PDF or CSV
5. Click "Download"

You can use these reports for:
- Parent-teacher conferences
- Assessment records
- Sharing with administrators
- Identifying students who need support
      `
    },
    {
      id: 'analytics-4',
      category: 'Viewing Student Progress/Analytics',
      question: 'How can I identify students who need help?',
      answer: `
Look for these indicators in Analytics:

🔴 **Red Flags:**
- Low completion rate (< 50%)
- Repeated incorrect attempts on same words
- Long time away from platform
- Below average stars compared to peers

**What to do:**
1. Review their specific struggles
2. Reassign easier activities
3. Provide additional practice
4. Consider one-on-one support
5. Follow up on progress

Use the "Track Student" feature to monitor improvement!
      `
    },
  ]
};

export default helpContent;
