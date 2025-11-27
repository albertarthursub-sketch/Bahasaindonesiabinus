# Image-Based Vocabulary Learning System

## Overview

The application now supports two learning modes for students:

### 1. **Drag & Drop Syllables** (Existing)
- Students drag syllables to reconstruct complete words
- Learn pronunciation through matching activity
- Interactive gamified experience

### 2. **Image Vocabulary** (New) 
- Students view images of daily objects
- Select the correct name from multiple options
- Hear native pronunciation via speech synthesis
- Learn: Colors, Numbers, Daily Objects (e.g., sepatu/shoe, apel/apple)

## For Teachers: Creating Image Vocabulary Lists

### Step 1: Create New List
1. Go to Teacher Dashboard
2. Click "📚 Create List" button
3. Select **"Image Vocabulary"** mode from the learning mode selector

### Step 2: Add Vocabulary Items
When creating an image vocabulary list, you can:
- Add items with images one by one
- Enter the Bahasa Indonesia name (e.g., "sepatu", "meja", "rumah")
- Upload an image for each item (JPG, PNG supported)
- System automatically generates pronunciation

### Step 3: Supported Categories

**Daily Objects:**
- sepatu (shoe)
- meja (table)
- kursi (chair)
- pintu (door)
- jendela (window)
- rumah (house)
- buku (book)
- pensil (pencil)
- tas (bag)

**Colors:**
- merah (red)
- biru (blue)
- kuning (yellow)
- hijau (green)
- hitam (black)
- putih (white)

**Numbers:**
- satu (one)
- dua (two)
- tiga (three)
- empat (four)
- lima (five)
- enam (six)
- tujuh (seven)
- delapan (eight)
- sembilan (nine)
- sepuluh (ten)

## For Students: Learning with Image Vocabulary

### How It Works:
1. Student enters teacher code and joins class
2. Selects an **Image Vocabulary** list
3. For each item:
   - Views image of the object
   - Clicks "Hear Pronunciation" button to listen to name
   - Selects correct answer from 4 options
   - Receives immediate feedback (✅ Correct / ❌ Wrong)
   - Earns stars for correct answers

### Learning Flow:
```
View Image → Hear Pronunciation → Select Answer → Get Feedback → Next Item
```

### Scoring:
- 1 point per correct answer
- Final score shown at completion
- Percentage accuracy calculated
- Progress tracked by teacher

## Technical Implementation

### Components Created:

1. **ImageVocabularyLearning.jsx**
   - Main learning interface for students
   - Displays images with multiple choice options
   - Handles pronunciation via Web Speech API
   - Manages scoring and progress

2. **AddVocabularyWithImage.jsx**
   - Modal for teachers to add image vocabulary
   - Image upload to Firebase Storage
   - Form validation and error handling

3. **LearningModeSelector.jsx**
   - Selection interface for teachers
   - Displays available learning modes
   - Visual descriptions of each mode

### Database Structure:

```javascript
{
  id: "unique-id",
  title: "Daily Objects",
  mode: "image-vocabulary", // or "syllable-matching"
  teacherId: "teacher-uid",
  words: [
    {
      name: "sepatu",
      imageUrl: "https://storage...",
      type: "image-vocabulary"
    },
    {
      name: "meja",
      imageUrl: "https://storage...",
      type: "image-vocabulary"
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Features

### For Students:
- ✅ Native speaker pronunciation (Web Speech API)
- ✅ Immediate visual feedback (green/red)
- ✅ Progress tracking with visual bar
- ✅ Score calculation and percentage
- ✅ Celebration sounds for correct answers
- ✅ Multiple choice (4 options per question)
- ✅ Mobile responsive interface

### For Teachers:
- ✅ Easy image upload
- ✅ Flexible vocabulary addition
- ✅ Category organization
- ✅ Firebase Cloud Storage integration
- ✅ View student scores and progress
- ✅ Mix different learning modes in same class

## How to Use

### Teacher: Creating Image Vocabulary List
```
1. Login to Teacher Dashboard
2. Click "Create List"
3. Select "Image Vocabulary" mode
4. Enter title (e.g., "Daily Objects")
5. For each item:
   - Enter name in Bahasa Indonesia
   - Upload clear image
   - Click "Add Item"
6. Save and share code with students
```

### Student: Learning with Images
```
1. Enter teacher code
2. Select list
3. For each question:
   - Look at image
   - Click "Hear Pronunciation" to listen
   - Select one of 4 answer options
   - See if correct immediately
4. View final score and congratulations message
```

## Pronunciation

The system uses **Web Speech API** with Indonesian language settings:
- Language: `id-ID`
- Speech rate: 0.8 (slower for clarity)
- Automatic fallback if not supported

Examples of pronunciations:
- "sepatu" → /sə-pá-tu/ (shoe)
- "meja" → /mé-ja/ (table)
- "rumah" → /rú-mah/ (house)

## Integration with Existing System

- ✅ Works with current teacher dashboard
- ✅ Compatible with existing student login
- ✅ Stores in same Firestore database
- ✅ Uses same authentication system
- ✅ Respects teacher data isolation
- ✅ Can mix with syllable-matching mode

## Future Enhancements

Potential additions:
- Audio file upload instead of text-to-speech
- Category templates (pre-made word sets)
- Image search/generation integration
- Flashcard review mode
- Pronunciation recording by teacher
- Difficulty levels (Level 1, 2, 3)
- Timed challenges
- Achievement badges

## Troubleshooting

**Issue: Images not loading**
- Check Firebase Storage permissions
- Verify image URL is valid
- Try different image format

**Issue: Pronunciation not working**
- Check browser speech synthesis support
- Ensure language is set to Indonesian
- Try Chrome (best support) or Edge

**Issue: Images too large**
- Compress images before upload
- Recommended size: 400x400 pixels
- File size: under 2MB

## Browser Compatibility

- ✅ Chrome/Chromium (full support)
- ✅ Firefox (full support)
- ✅ Safari (full support)
- ✅ Edge (full support)
- ⚠️ IE11 (not supported)

## Notes

- All images stored in Firebase Storage
- Automatic CORS handling
- Progressive loading with indicators
- Mobile-optimized layouts
- Accessible color contrasts and buttons
