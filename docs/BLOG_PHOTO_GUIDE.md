# 📸 Blog Photo Guide

## 🎯 **How to Add Photos to Your Blogs**

### **1. Hero Image (Main Blog Image)**

**Location:** Frontmatter (YAML header at the top of the markdown file)

**Format:**
```yaml
---
title: "Your Blog Title"
excerpt: "Your blog excerpt"
author: "Author Name"
date: "2025-01-01"
image: "https://your-image-url.com/image.jpg"  # ← Hero image here
slug: "your-blog-slug"
---
```

**Requirements:**
- **Size:** 800x400 pixels (recommended)
- **Format:** JPG, PNG, or WebP
- **Quality:** High resolution for good display

### **2. Inline Content Images**

**Location:** Anywhere in the markdown content

**Format:**
```markdown
![Alt text describing the image](image-url-here)

*Caption below the image*
```

**Examples:**
```markdown
![Bloating symptoms illustration](https://picsum.photos/600/300?random=10)

*Common bloating symptoms and their visual representation*

![Food diary example](https://picsum.photos/600/300?random=15)

![Yoga poses for digestion](https://picsum.photos/600/300?random=20)
```

### **3. Image Sources & Options**

#### **A. External Image URLs**
```markdown
![Description](https://example.com/image.jpg)
```

#### **B. Local Images (Recommended)**
```markdown
![Description](/images/blogs/bloating-symptoms.jpg)
```

#### **C. Placeholder Images (Development)**
```markdown
![Description](https://picsum.photos/600/300?random=25)
```

### **4. Image Best Practices**

#### **Size Guidelines:**
- **Hero Image:** 800x400px
- **Content Images:** 600x300px or 800x400px
- **Thumbnails:** 300x200px
- **Infographics:** 800x600px

#### **File Naming:**
```
bloating-symptoms.jpg
food-diary-example.png
yoga-poses-digestion.webp
```

#### **Alt Text:**
- Always provide descriptive alt text
- Helps with accessibility and SEO
- Should describe what the image shows

### **5. Advanced Image Features**

#### **A. Image with Caption**
```markdown
![Bloating symptoms illustration](https://picsum.photos/600/300?random=10)

*Common bloating symptoms and their visual representation*
```

#### **B. Image with Link**
```markdown
[![Clickable image](https://picsum.photos/600/300?random=25)](https://example.com)
```

#### **C. Responsive Images**
```markdown
![Responsive image](https://picsum.photos/600/300?random=30)
```

### **6. Image Storage Options**

#### **Option 1: Local Storage (Recommended)**
```
guildup-frontend/
├── public/
│   └── images/
│       └── blogs/
│           ├── bloating-symptoms.jpg
│           ├── food-diary.png
│           └── yoga-poses.jpg
```

**Usage:**
```markdown
![Description](/images/blogs/bloating-symptoms.jpg)
```

#### **Option 2: Cloud Storage**
- **AWS S3**
- **Cloudinary**
- **ImageKit**
- **Firebase Storage**

#### **Option 3: CDN**
- **Cloudflare Images**
- **Fastly Image Optimizer**
- **Imgix**

### **7. Image Optimization**

#### **Before Upload:**
- Compress images (use tools like TinyPNG, ImageOptim)
- Convert to WebP format when possible
- Resize to appropriate dimensions
- Keep file sizes under 500KB for content images

#### **Recommended Tools:**
- **Compression:** TinyPNG, ImageOptim, Squoosh
- **Resizing:** Canva, Photoshop, GIMP
- **Format Conversion:** Online converters, ImageMagick

### **8. SEO & Accessibility**

#### **SEO Best Practices:**
- Use descriptive filenames
- Include relevant alt text
- Optimize image titles
- Use appropriate image dimensions

#### **Accessibility:**
- Always include alt text
- Ensure sufficient color contrast
- Don't rely solely on images for information
- Use captions when helpful

### **9. Example Blog with Multiple Images**

```markdown
---
title: "Complete Guide to Healthy Eating"
excerpt: "Learn the fundamentals of nutrition and healthy eating habits"
author: "Nutrition Expert"
date: "2025-01-01"
image: "/images/blogs/healthy-eating-hero.jpg"
slug: "healthy-eating-guide"
---

# Complete Guide to Healthy Eating

![Healthy food plate](https://picsum.photos/800/400?random=40)

*Balanced meal with vegetables, protein, and whole grains*

## Understanding Macronutrients

![Macronutrients chart](https://picsum.photos/600/300?random=41)

*Visual breakdown of proteins, carbohydrates, and fats*

### Protein Sources

![Protein-rich foods](https://picsum.photos/600/300?random=42)

*Lean meats, fish, legumes, and dairy products*

## Meal Planning Tips

![Weekly meal planner](https://picsum.photos/600/300?random=43)

*Organized weekly meal planning template*
```

### **10. Troubleshooting**

#### **Common Issues:**
1. **Image not displaying:** Check URL and file permissions
2. **Slow loading:** Optimize image size and format
3. **Poor quality:** Use higher resolution source images
4. **Layout breaking:** Ensure consistent image dimensions

#### **Solutions:**
- Verify image URLs are accessible
- Use appropriate image dimensions
- Optimize file sizes
- Test on different devices

---

## 🚀 **Next Steps**

1. **Create an images folder** in your public directory
2. **Add your blog images** with proper naming
3. **Update your blog markdown** with image references
4. **Test the display** on different screen sizes
5. **Optimize images** for web performance

## 📞 **Need Help?**

If you need assistance with:
- Image optimization
- Setting up image storage
- Adding images to specific blogs
- Troubleshooting image issues

Contact the development team or refer to this guide!
