# Image Suggestions Guide

> Image type classifications and sourcing guidelines for WeChat articles

---

## Core Principles

### 1. Purpose-Driven Images
Every image should serve one of these purposes:
- **Illustrate** complex concepts
- **Demonstrate** visual differences
- **Break up** long text blocks
- **Enhance** professional appearance

### 2. Mobile-First Optimization
- Optimize for vertical mobile screens
- Ensure text is readable on small displays
- Keep file sizes reasonable (< 500KB per image)
- Test on actual WeChat mobile preview

### 3. Brand Consistency
- Dark or neutral tones preferred
- Minimalist, tech-focused aesthetic
- Professional, not overly designed
- Avoid stock photo clichés

---

## Image Type Categories

### 1. Cover Images (封面图)

**Purpose:** Attract clicks and set article tone

**Requirements:**
- **Aspect Ratio:** 16:9 (e.g., 1200×675px)
- **Min Width:** 1200px
- **Style:** Abstract, minimalist, tech-focused
- **Colors:** Dark themes or neutral palettes
- **Text:** None (WeChat adds title automatically)

**Recommended Styles:**

**A. Abstract Tech Aesthetic**
```
Visual Elements:
- Geometric shapes and lines
- Gradient backgrounds (dark blues, purples, grays)
- Circuit board patterns
- Code-inspired abstract forms
- Minimalist digital art

Search Keywords:
"abstract technology dark"
"minimalist code background"
"geometric tech pattern"
"digital gradient dark"
```

**B. Tool/Product Screenshots (Clean)**
```
Visual Elements:
- Clean IDE screenshots
- Product interface highlights
- Dark mode screenshots
- Minimal UI elements

Examples:
- Cursor editor interface (dark mode)
- VS Code with specific extension
- Terminal with interesting output
```

**C. Typography-Based**
```
Visual Elements:
- Large code keywords
- Technical terms as visual elements
- Monospace fonts
- High contrast text on dark background

Examples:
- "React Server Components" in code font
- Terminal-style text layout
```

**Stock Image Sources:**
- Unsplash: https://unsplash.com/s/photos/code-dark
- Pexels: https://www.pexels.com/search/programming/
- Pixabay: https://pixabay.com/images/search/technology/

**Creation Tools:**
- Canva (with dark templates)
- Figma (design from scratch)
- Photopea (free Photoshop alternative)

---

### 2. Code Screenshots (代码截图)

**Purpose:** Show implementation details

**Best Practices:**

**Window Setup:**
```
Editor: VS Code or Cursor
Theme: GitHub Dark / One Dark Pro / Monokai
Font: Fira Code / JetBrains Mono / Source Code Pro
Size: 14-16px
```

**Screenshot Guidelines:**
- Show 10-20 lines max
- Include relevant syntax highlighting
- Capture actual code, not lorem ipsum
- Crop tightly to code area
- High DPI/Retina resolution

**Tools:**
- macOS: Cmd+Shift+4 (native)
- Windows: Snipping Tool / Snip & Sketch
- Carbon (code image generator): https://carbon.now.sh/
- Ray.so: https://ray.so/

**Example Scenarios:**
```markdown
位置：介绍 useAICompletion Hook 实现

建议：
- 截图完整的 Hook 定义
- 使用 GitHub Dark 主题
- 突出关键类型标注
- 文件名显示为 useAICompletion.ts
```

---

### 3. Architecture Diagrams (架构图)

**Purpose:** Illustrate system design and data flow

**Diagram Types:**

**A. Component Architecture**
```
Use for:
- System structure explanations
- Module relationships
- Component hierarchies

Style:
- Clean, minimal boxes and arrows
- Monochrome or 2-color max
- Sans-serif fonts
- Clear labels

Tools:
- Excalidraw: https://excalidraw.com/
- draw.io: https://app.diagrams.net/
- Figma (for custom designs)
```

**B. Data Flow Diagrams**
```
Use for:
- Request/response cycles
- State management flows
- API call sequences

Style:
- Numbered steps
- Directional arrows
- Process boxes
- Clear start/end points

Example:
Server Components data flow:
Browser → Server → Database → Server → Browser
```

**C. Comparison Diagrams**
```
Use for:
- Side-by-side comparisons
- Before/after scenarios
- Different approaches

Layout:
- Two columns
- Parallel structures
- Highlight differences

Example:
SSR vs RSC rendering process comparison
```

**Design Principles:**
- Maximum 3 colors
- Large, readable fonts (min 18px)
- Clear hierarchy
- Generous whitespace

---

### 4. Comparison Tables (对比表格)

**Purpose:** Compare features, tools, or approaches

**Format:**

**Simple Table (Markdown):**
```markdown
| 特性 | Cursor | GitHub Copilot |
|------|--------|----------------|
| Inline Diff | ✅ | ❌ |
| Chat Mode | ✅ | ✅ |
| 本地模型 | ❌ | ❌ |
| 价格 | $20/月 | $10/月 |
```

**Visual Table (Image):**
- Use when markdown is insufficient
- Export from Figma/Canva
- Keep design minimal
- Ensure mobile readability

**Tools:**
- Markdown tables (preferred)
- Figma (for complex tables)
- Canva tables feature
- Excel/Google Sheets → screenshot

---

### 5. Process Flowcharts (流程图)

**Purpose:** Document step-by-step processes

**Flowchart Types:**

**A. Decision Trees**
```
Use for:
- "Should I use X?" decisions
- Technology selection guides
- Troubleshooting flows

Style:
- Diamond shapes for decisions
- Rectangles for actions
- Clear yes/no paths

Example:
"Should I use AI coding tools?" decision tree
```

**B. Sequential Processes**
```
Use for:
- Implementation steps
- Deployment workflows
- Migration guides

Style:
- Numbered steps
- Linear flow
- Clear entry/exit

Example:
"Migrating from Webpack to Vite" step-by-step
```

**Tools:**
- Excalidraw (quick & clean)
- Mermaid.js (code-based, can export)
- Lucidchart (professional)
- Whimsical (collaborative)

---

### 6. Tech Memes / Humor (技术梗图)

**Purpose:** Provide comic relief (use sparingly)

**Guidelines:**

**When to Use:**
- To break up dense technical content
- After a heavy section (as transition)
- Maximum 1 per article

**What's Acceptable:**
```
✅ Classic programming memes (Drake format)
✅ Well-known tech jokes (visual puns)
✅ Self-aware engineering humor

❌ Overused clichés
❌ Offensive or exclusionary content
❌ Memes requiring internet culture knowledge
```

**Example Scenarios:**
```
Topic: AI tools aren't perfect
Meme: "Expectation vs Reality" format
- Expectation: AI writes perfect code
- Reality: AI writes code that "mostly" works
```

**Sources:**
- r/ProgrammerHumor (curated)
- Twitter tech community
- Create custom using meme generators

---

## Image Placement Strategy

### Per Article (2000 words)

**Recommended Distribution:**
- 1 Cover image (required)
- 2-3 Content images
- 4-5 images total (max)

**Placement Rules:**

**After Opening (First 200 words):**
```
Type: Architecture diagram or concept illustration
Purpose: Set visual context
```

**Mid-Article (Around 800-1200 words):**
```
Type: Code screenshot or comparison table
Purpose: Support technical explanation
```

**Before Conclusion:**
```
Type: Flowchart or summary diagram
Purpose: Reinforce key concepts
```

**Avoid:**
- Images in first paragraph
- Multiple images in sequence
- Images without context
- Images as pure decoration

---

## Image Captioning

### Caption Format

**Structure:**
```markdown
![Alt text for SEO](image-url)
*▲ Caption explaining the image*
```

**Caption Best Practices:**
- Keep under 15 words
- Explain what's shown
- Connect to surrounding text
- Use ▲ or ▼ arrow for visual cue

**Examples:**

**Good Captions:**
```markdown
![Cursor inline diff](image-url)
*▲ Inline diff 让代码修改更直观*

![RSC data flow](image-url)
*▲ Server Components 的数据流向图*

![Code example](image-url)
*▲ useAICompletion Hook 的完整实现*
```

**Avoid:**
```markdown
❌ ![Image](url)
   (No caption - reader doesn't know context)

❌ ![Cursor screenshot](url)
   *A screenshot of Cursor showing some code*
   (Too vague, doesn't explain value)
```

---

## Image Creation Workflow

### Step 1: Identify Need

Ask:
- Does this concept need visualization?
- Can text alone sufficiently explain this?
- Will an image enhance understanding?

**Create image if:**
- ✅ Explaining complex architecture
- ✅ Showing visual differences
- ✅ Breaking up 500+ word sections
- ✅ Demonstrating UI/code examples

**Skip image if:**
- ❌ Simple concept adequately explained by text
- ❌ Would be purely decorative
- ❌ Doesn't add new information

### Step 2: Choose Image Type

Match type to content:
- **Concept explanation** → Architecture diagram
- **Implementation detail** → Code screenshot
- **Tool comparison** → Table or side-by-side
- **Process walkthrough** → Flowchart
- **Cover art** → Abstract tech visual

### Step 3: Create or Source

**Create Custom (Preferred):**
- Architecture diagrams: Excalidraw
- Code screenshots: Carbon.now.sh
- Flowcharts: Mermaid or draw.io

**Source Stock:**
- Cover images: Unsplash (dark tech themes)
- Placeholder images: Unsplash/Pexels

### Step 4: Optimize

**Technical Optimization:**
- Compress images (TinyPNG, ImageOptim)
- Target 200-500KB per image
- Use WebP format if supported
- Maintain aspect ratio

**Visual Optimization:**
- Test on mobile preview
- Ensure text is readable
- Check color contrast
- Verify alignment with brand

### Step 5: Add Context

- Write descriptive alt text
- Add explanatory caption
- Reference in surrounding text
- Ensure flow makes sense

---

## Common Image Needs by Article Type

### Technical Deep Dive

```
Cover: Abstract tech aesthetic
Image 1: Architecture diagram (core concept)
Image 2: Code screenshot (implementation)
Image 3: Flowchart (decision logic)
```

### Tool Review

```
Cover: Product screenshot or logo-based
Image 1: Interface screenshot (key feature)
Image 2: Comparison table (vs alternatives)
Image 3: Workflow diagram (usage pattern)
```

### Opinion Piece

```
Cover: Typography-based or abstract
Image 1: Diagram (mental model)
Image 2: (Optional) Meme for tone break
Image 3: Summary visual
```

### How-To Guide

```
Cover: Process-oriented visual
Image 1: Starting state screenshot
Image 2: Key steps flowchart
Image 3: End result screenshot
```

---

## Image Suggestion Template

When suggesting images, use this format:

```markdown
【配图建议】

**位置 1（封面图）：**
- 类型：抽象科技风
- 建议：深色背景 + 简洁几何线条
- 参考关键词：React components, architecture, minimalist
- 尺寸：1200×675px (16:9)
- 来源建议：Unsplash 搜索 "abstract technology dark"

**位置 2（正文 - 架构图）：**
- 类型：技术架构图
- 内容：Server vs Client Component 数据流向对比
- 工具建议：Excalidraw / draw.io
- 说明：展示数据如何从数据库 → Server Component → Browser

**位置 3（正文 - 代码截图）：**
- 类型：代码实现截图
- 内容：useAICompletion Hook 完整实现
- 主题：VSCode + GitHub Dark
- 注意：突出类型标注和关键逻辑

**位置 4（总结前 - 对比表格）：**
- 类型：功能对比表
- 内容：Cursor vs Copilot 核心特性对比
- 格式：Markdown 表格即可
- 维度：Inline diff, Chat, 价格, IDE 支持
```

---

## Stock Image Search Keywords

### For Cover Images

**Dark Tech Aesthetics:**
```
- "code dark background"
- "abstract technology night"
- "programming minimalist"
- "digital dark gradient"
- "geometric tech pattern"
- "circuit board abstract"
```

**Frontend Specific:**
```
- "react components abstract"
- "javascript dark code"
- "web development minimalist"
- "frontend architecture"
```

**AI/ML Themed:**
```
- "artificial intelligence dark"
- "machine learning abstract"
- "AI technology minimalist"
- "neural network visualization"
```

### For Content Images

**UI Screenshots:**
```
- "code editor dark mode"
- "IDE interface clean"
- "terminal command line"
- "developer tools screenshot"
```

**Architecture/Diagrams:**
```
- "software architecture diagram"
- "system design flowchart"
- "data flow visualization"
- "component diagram"
```

---

## Quality Checklist

Before using an image:

**Technical:**
- [ ] File size < 500KB
- [ ] Dimensions appropriate for mobile
- [ ] Image is clear and high-resolution
- [ ] Format is widely supported (JPG/PNG/WebP)

**Content:**
- [ ] Image adds value, not just decoration
- [ ] Visuals match brand aesthetic (dark/minimal)
- [ ] Text in image is readable on mobile
- [ ] Image relates directly to surrounding text

**Accessibility:**
- [ ] Alt text is descriptive
- [ ] Caption provides context
- [ ] Image is not the only way to understand content
- [ ] Color contrast is sufficient

**Legal:**
- [ ] Image is properly licensed (free stock or self-created)
- [ ] Attribution added if required
- [ ] No copyrighted material used without permission
