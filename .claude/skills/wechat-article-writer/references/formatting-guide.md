# Formatting Guide: WeChat Official Account Layout

> WeChat-specific formatting rules and layout standards for technical articles

---

## Core Formatting Principles

### 1. Mobile-First Reading Experience
- Design for vertical scrolling on mobile screens
- Optimize for fragmented reading (subway, commute, breaks)
- Every scroll should deliver value

### 2. Visual Breathing Room
- Short paragraphs with clear separation
- Strategic use of whitespace
- Avoid wall-of-text syndrome

### 3. Functional Formatting
- Formatting serves readability, not decoration
- Every element has a purpose
- Consistency over creativity

---

## Heading Hierarchy

### Structure Rules

**H2 for Main Sections (##)**
```markdown
## 为什么需要 RSC？

[Content...]
```

**H3 for Subsections (###)**
```markdown
### 核心机制解析

[Content...]
```

**Avoid H4 and Below**
- WeChat editor doesn't render H4+ well
- If you need H4, restructure your content
- Prefer lists over deep nesting

### Heading Best Practices

**✅ Good:**
```markdown
## RSC 的三个核心特性

### 1. 服务端渲染

### 2. 零客户端 JS

### 3. 自动代码分割
```

**❌ Avoid:**
```markdown
## React Server Components 的核心特性、工作原理及实践应用

#### 特性 1
```

---

## Paragraph Formatting

### Length: 2-4 Lines Maximum

**Ideal Paragraph Structure:**
```
Line 1: Topic sentence
Line 2-3: Explanation or example
Line 4: Transition or conclusion (optional)
```

**Example:**
```markdown
Prompt Engineering 不是玄学。

它的本质是接口设计：
明确输入、输出、边界条件。

理解这点，就能写好 Prompt。
```

### Paragraph Spacing

**Single blank line between paragraphs:**
```markdown
第一段内容。

第二段内容。
```

**Two blank lines before major sections:**
```markdown
内容结束。


## 新的主要章节
```

---

## List Formatting

### Unordered Lists

**Use for:**
- Non-sequential items
- Feature comparisons
- Quick takeaways

**Format:**
```markdown
AI 工具的三个核心价值：

- 减少重复劳动
- 即时文档查询
- 上下文代码补全
```

### Ordered Lists

**Use for:**
- Step-by-step processes
- Prioritized items
- Chronological sequences

**Format:**
```markdown
使用 Cursor 的正确姿势：

1. 明确你要解决的问题
2. 用工程语言描述需求
3. Review 生成的代码
4. 必要时手动调整
```

### Nested Lists (Use Sparingly)

**Avoid deep nesting:**
```markdown
✅ Good:
AI 工具适用场景：

**前端开发：**
- 组件代码生成
- 样式调整优化
- API 集成代码

**后端开发：**
- CRUD 接口生成
- 数据库查询优化
- 错误处理模板

❌ Too Deep:
- Level 1
  - Level 2
    - Level 3
      - Level 4 (避免!)
```

---

## Emoji Usage Rules

### Functional Emojis Only

**Purpose: Structure and Navigation**

**Approved Emojis:**
- 👉 Direction/pointer
- ⚠️ Warning/caution
- ✅ Correct/recommended
- ❌ Incorrect/avoid
- 🤔 Think about this
- 💡 Key insight
- 📌 Important note
- 🔍 Deep dive
- ⭐ Highlight

**Usage Examples:**

**Direction:**
```markdown
👉 核心要点：理解 RSC 不是为了追新，而是解决实际问题。
```

**Warning:**
```markdown
⚠️ 注意：AI 生成的代码需要仔细 review，不能直接上生产。
```

**Correct/Incorrect:**
```markdown
✅ 用 AI 工具提升效率
❌ 用 AI 工具替代思考
```

**Key Insight:**
```markdown
💡 Prompt Engineering = API 接口设计
```

### Emojis to Avoid

**❌ Emotional Emojis:**
```
❌ 😂 🤣 😭 😱 🥺 🙏
❌ 💪 👍 🔥 💯
```

**❌ Decorative Emojis:**
```
❌ 🌟 ✨ 🎉 🎊 🎈
```

**❌ Excessive Usage:**
```markdown
❌ Bad:
🔥 AI 工具 🔥 太强了 💪
用了都说好 👍👍👍
效率直接 🚀🚀🚀

✅ Good:
AI 工具确实能提升效率。

✅ 适合重复性工作
⚠️ 但不能替代架构设计
```

---

## Code Block Formatting

### Inline Code

**Use for:**
- Variable names: `useState`
- Short code snippets: `const [state, setState]`
- File names: `App.tsx`
- Commands: `npm install`

**Format:**
```markdown
React 的 `useEffect` Hook 用于处理副作用。
```

### Code Blocks

**Always specify language:**
````markdown
```typescript
// Good: Language specified
export function useAI() {
  // Implementation
}
```
````

**Add comments for context:**
````markdown
```typescript
// 这个 Hook 的目的：隔离 AI 请求逻辑
export function useAICompletion(prompt: string) {
  const [result, setResult] = useState('');

  // 使用 useCallback 避免不必要的重新创建
  const complete = useCallback(async () => {
    const data = await aiService.complete(prompt);
    setResult(data);
  }, [prompt]);

  return { result, complete };
}
```
````

**Keep code blocks short:**
```markdown
✅ Good: Show only relevant code (10-20 lines)
❌ Avoid: Dumping entire files (50+ lines)
```

### Code Block Placement

**Before code block:**
```markdown
实现一个简单的 AI Hook：

```typescript
[Code here]
```

**After code block:**
```markdown
```typescript
[Code here]
```

关键点：组件只关心接口，不关心实现。
```

---

## Callout Boxes (Visual Separators)

### Horizontal Rules

**Use sparingly for major section breaks:**
```markdown
内容段落。

---

## 新的重要章节
```

### Quote Blocks

**Use for:**
- Key takeaways
- Important warnings
- Summary statements

**Format:**
```markdown
> **核心观点**
>
> AI 工具是助手，不是架构师。
> 它能提升效率，但不能替代思考。
```

### Text Emphasis

**Bold for Key Terms:**
```markdown
**Prompt Engineering** 的本质是接口设计。
```

**Italic for Subtle Emphasis (Rare):**
```markdown
这不是_必须_的，但建议这么做。
```

**Avoid ALL CAPS:**
```markdown
❌ 这个方法非常重要！！！
✅ 这个方法很重要。
```

---

## Table Formatting

### Simple Tables

**Use for comparisons:**
```markdown
| 特性 | Cursor | GitHub Copilot |
|------|--------|----------------|
| Inline Diff | ✅ | ❌ |
| Chat 模式 | ✅ | ✅ |
| 本地模型 | ❌ | ❌ |
```

**Keep tables simple:**
- Maximum 4 columns
- Maximum 6 rows
- Use checkmarks (✅/❌) for yes/no
- Avoid complex nested content

### Comparison Lists (Alternative to Tables)

**Better for mobile:**
```markdown
**Cursor 的优势：**
✅ Inline diff 体验好
✅ Multi-file editing
✅ Composer 模式

**Copilot 的优势：**
✅ IDE 集成深
✅ 生态成熟
✅ 企业支持好
```

---

## Link Formatting

### Inline Links

**Descriptive link text:**
```markdown
✅ 详见 [Next.js 官方文档](https://nextjs.org)
❌ 详见 [这里](https://nextjs.org)
```

### Reference-Style Links (For Multiple References)

```markdown
React Server Components[^1] 改变了渲染模式。

[^1]: https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components
```

### External Resource Callouts

```markdown
📖 **延伸阅读**
- [RSC 官方文档](https://...)
- [Dan Abramov 的博客](https://...)
```

---

## Opening Section Format

### Standard Opening Structure

**Pattern 1: Question Hook**
```markdown
[技术名词] 到底解决了什么问题？

如果只看文档，你会觉得它很完美。
但实际项目里，有些坑文档不会告诉你。

这篇文章，从工程视角拆解 [技术名词]。
```

**Pattern 2: Problem Hook**
```markdown
你可能遇到过这个场景：

[具体的工程问题描述]

这不是代码问题，而是架构选择的问题。
```

**Pattern 3: Observation Hook**
```markdown
这两年，[某个趋势] 越来越明显。

但大部分讨论都在说"是什么"，
很少有人讲"为什么"和"何时用"。
```

---

## Closing Section Format

### Standard Closing Structure

**Pattern 1: Practical Summary**
```markdown
## 总结

如果记住三件事：

1. [核心观点 1]
2. [核心观点 2]
3. [核心观点 3]

这篇文章的目的达到了。
```

**Pattern 2: Trade-off Acknowledgment**
```markdown
## 写在最后

[技术名词] 不是银弹。

它适合 [场景 A]，但不适合 [场景 B]。
理解这点，比追新更重要。
```

**Pattern 3: Actionable Next Step**
```markdown
## 下一步

如果你想试试 [技术/工具]：

1. 从小范围开始（一个功能模块）
2. 观察实际效果
3. 根据反馈决定是否扩大使用

别一上来就重构整个项目。
```

---

## Special Section Formats

### "说人话版总结"

**Use at the end of technical deep dives:**
```markdown
## 说人话版总结

AI 工具能干什么？
✅ 写重复代码
✅ 查 API 文档
✅ 智能补全

不能干什么？
❌ 做架构决策
❌ 理解业务逻辑
❌ 优化性能

简单说：助手，不是架构师。
```

### "踩坑实录"

**Use for war story sharing:**
```markdown
## 踩坑实录

用 Cursor 做大型重构时，我翻车了。

**问题：**
AI 生成的代码看起来没问题，
但它理解不了我的迁移路径，
导致依赖关系改错了。

**教训：**
大型重构还是得手动改，
AI 只能辅助小范围修改。
```

### "判断标准"

**Use for decision frameworks:**
```markdown
## 判断标准

什么时候该用 [技术 A]？

✅ 适合场景：
- [具体场景 1]
- [具体场景 2]

❌ 不适合场景：
- [具体场景 1]
- [具体场景 2]

没有绝对的对错，看场景。
```

---

## Image Placement and Captioning

### Image Placement

**After introducing the concept:**
```markdown
Server Components 的数据流向是这样的：

![RSC Data Flow](image-url)

可以看到，组件在服务端获取数据。
```

### Image Captions

**Always add context:**
```markdown
![Cursor Inline Diff 功能演示](image-url)
*▲ Inline diff 让代码审查更直观*
```

### Cover Image Guidelines

**Requirements:**
- 16:9 aspect ratio
- Minimum 1200px width
- Dark or neutral tones preferred
- Minimalist, tech-focused aesthetic
- No text overlay (WeChat adds title automatically)

---

## Mobile Optimization Checklist

Before publishing, verify:

**Paragraph Length:**
- [ ] No paragraph exceeds 4 lines
- [ ] Clear spacing between paragraphs

**List Formatting:**
- [ ] Lists are concise (max 7 items)
- [ ] No deeply nested lists (max 2 levels)

**Code Blocks:**
- [ ] Code blocks are short (10-20 lines)
- [ ] Language is specified
- [ ] Horizontal scroll is minimized

**Emoji Usage:**
- [ ] Only functional emojis used
- [ ] No emotional or decorative emojis
- [ ] Emoji frequency is moderate

**Visual Elements:**
- [ ] Images are properly sized and captioned
- [ ] Tables are simple (max 4 columns)
- [ ] Adequate whitespace throughout

**Readability:**
- [ ] Each screen scroll delivers value
- [ ] Headings create clear structure
- [ ] Text-to-whitespace ratio is balanced
