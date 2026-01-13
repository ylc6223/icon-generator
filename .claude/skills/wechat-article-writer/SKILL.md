---
name: wechat-article-writer
description: Write and optimize WeChat Official Account articles for frontend development and AI topics. Use this skill when the user requests to write WeChat articles, optimize article content, generate titles, create outlines, or needs formatting suggestions. The skill focuses on technical content with a balance of professionalism and approachability (7:3 ratio), targeting frontend developers interested in AI.
---

# WeChat Article Writer

## Overview

This skill enables writing and optimizing articles for the WeChat Official Account "前端之外" (Beyond Frontend), which focuses on frontend development and AI topics. The skill provides end-to-end support from ideation to publication-ready content, maintaining a distinctive brand voice that balances engineering rigor with accessible communication.

## Core Capabilities

### 1. Generate Article Outline and Titles

When the user requests article creation on a topic, start by generating:

**Process:**
1. Clarify the topic scope and target audience
2. Generate 3-5 compelling title options following the formulas in `references/title-formulas.md`
3. Create a structured outline with:
   - Hook/Opening (引言)
   - Main body sections (2-4 key points)
   - Practical takeaways or code examples
   - Conclusion/Call-to-action

**Title Guidelines:**
- Load `references/title-formulas.md` for proven patterns
- Keep titles between 15-25 characters
- Balance curiosity with clarity
- Avoid clickbait or anxiety-inducing language

**Example User Request:**
> "帮我写一篇关于React Server Components的文章"

**Expected Output:**
```
【标题选项】
1. React Server Components：前端架构的新可能
2. RSC 不是银弹，但值得理解
3. 从工程视角拆解 React Server Components

【文章大纲】
一、为什么需要 RSC？（问题背景）
二、RSC 的核心机制（技术拆解）
三、实际落地的工程考量（避坑指南）
四、何时该用，何时不该用（判断标准）
```

### 2. Write Full Article Content

After outline approval, generate complete article content following these principles:

**Structure:**
- **Opening (100-150 words)**: Hook with a relatable scenario or question
- **Body (1500-2500 words)**:
  - Short paragraphs (2-4 lines)
  - Clear subheadings
  - Code examples with explanatory comments
  - Engineering trade-offs discussion
- **Closing (100-150 words)**: Practical summary, no generic inspiration

**Tone Reference:**
- Consult `references/brand-voice.md` for brand personality
- Consult `references/writing-style-guide.md` for language patterns
- Maintain 70% professional + 30% approachable ratio

**Code Example Standards:**
```typescript
// ✅ Good: Purpose-driven with context
// This Hook isolates AI request logic to avoid
// direct model dependency in components

export function useAICompletion(prompt: string) {
  // Implementation that abstracts provider details
}

// ❌ Avoid: Code dump without explanation
```

### 3. Optimize Copy and Formatting

When the user requests optimization of existing content:

**Actions:**
1. Load `references/formatting-guide.md` for WeChat-specific layout rules
2. Apply formatting enhancements:
   - Break long paragraphs into 2-4 line chunks
   - Add functional emojis (👉 ⚠️ ✅ ❌) for structure
   - Ensure proper heading hierarchy
   - Format code blocks for readability
   - Add visual separators between sections

**Before/After Example:**

Before:
```
React Server Components是一个新特性，它允许组件在服务器上渲染，这样可以减少客户端的JavaScript包大小，提高性能，同时也能更好地处理数据获取的问题。
```

After:
```
React Server Components 解决三个核心问题：

✅ 减少客户端 JS 体积
✅ 服务端直接访问数据源
✅ 避免客户端 waterfall 请求

简单说：把不需要交互的逻辑留在服务器。
```

### 4. Generate Multiple Title Options

When asked to generate or optimize titles:

**Process:**
1. Reference `references/title-formulas.md` for proven patterns
2. Generate 5-7 variations covering different angles:
   - Problem-oriented: "为什么 X 没你想的那么简单"
   - Solution-oriented: "X 的三种工程实现方式"
   - Insight-oriented: "理解 X 的本质：不是 Y，而是 Z"
   - Comparison-oriented: "X vs Y：工程视角的选择"

**Quality Check:**
- Avoid: "震惊"、"必看"、"颠覆" etc.
- Avoid: Anxiety-inducing language
- Prefer: Specific, informative, with clear value proposition

### 5. Suggest Appropriate Images

When the user needs image suggestions:

**Process:**
1. Load `assets/image-suggestions.md` for image type guidelines
2. Suggest image types based on content:
   - **Code screenshots**: For implementation details
   - **Architecture diagrams**: For system design discussions
   - **Comparison tables**: For feature/approach comparisons
   - **Tech memes**: For humor relief (used sparingly)
   - **Cover images**: Abstract tech visuals or minimalist designs

**Suggestion Format:**
```
【配图建议】

位置1（封面图）：
- 类型：抽象科技风
- 建议：深色背景 + 简洁几何线条
- 参考关键词：React components, architecture, minimalist

位置2（架构图）：
- 类型：技术架构图
- 内容：Server vs Client Component 数据流向
- 工具建议：Excalidraw / draw.io

位置3（代码截图）：
- 展示 useAICompletion Hook 实现
- 使用 VSCode + GitHub Dark 主题
```

### 6. Add Compelling Openings/Closings

**Opening Templates** (选择最适合内容的风格):

**Problem-First:**
```
你可能遇到过这个场景：

[具体的工程问题描述]

这不是代码问题，而是架构选择的问题。
```

**Question-First:**
```
[技术名词] 到底解决了什么问题？

如果只看文档，你会觉得它很完美。
但实际项目里，有些坑文档不会告诉你。
```

**Observation-First:**
```
这两年，[某个趋势] 越来越明显。

但大部分讨论都在说"是什么"，
很少有人讲"为什么"和"何时用"。
```

**Closing Templates:**

**Practical Summary:**
```
## 总结

如果记住三件事：

1. [核心观点1]
2. [核心观点2]
3. [核心观点3]

这篇文章的目的达到了。
```

**Trade-off Acknowledgment:**
```
## 写在最后

[技术名词] 不是银弹。

它适合 [场景A]，但不适合 [场景B]。
理解这点，比追新更重要。
```

## Workflow Example

**User Request:**
> "帮我写一篇关于 AI Coding 工具的文章，聊聊 Cursor 和 GitHub Copilot"

**Step-by-Step Process:**

1. **Clarify Scope**
   - "这篇文章是偏对比评测，还是偏工程实践分享？"
   - "目标读者是新手还是已经在用 AI 工具的开发者？"

2. **Generate Outline + Titles**
   - Load `references/title-formulas.md`
   - Provide 3-5 title options
   - Present outline structure

3. **Write Full Content**
   - Reference `references/brand-voice.md` for tone
   - Reference `references/writing-style-guide.md` for language
   - Apply `references/formatting-guide.md` for layout

4. **Add Formatting & Emojis**
   - Load `assets/emoji-guide.md`
   - Apply functional emojis for structure

5. **Suggest Images**
   - Load `assets/image-suggestions.md`
   - Recommend specific image types and placement

6. **Final Review**
   - Verify tone balance (70% professional / 30% approachable)
   - Check no anxiety-inducing or hype language
   - Ensure engineering perspective maintained

## Resources

### references/
Documentation loaded into context as needed to inform content creation:

- **`brand-voice.md`**: Brand identity, positioning, and tone guidelines for "前端之外"
- **`writing-style-guide.md`**: Language patterns, expression preferences, and style ratio
- **`formatting-guide.md`**: WeChat-specific layout rules and formatting standards
- **`title-formulas.md`**: Proven title patterns and headline creation strategies

### assets/
Files used directly in output without loading into context:

- **`article-template.md`**: Standard article structure template
- **`emoji-guide.md`**: Functional emoji library for technical content
- **`image-suggestions.md`**: Image type classifications and sourcing guidelines

### scripts/
Not needed for this skill (content generation doesn't require executable automation).
