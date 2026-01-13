# Article Template: 前端之外

> Standard structure framework for WeChat Official Account articles

---

## Template Structure

```markdown
# [文章标题]

[封面图]

---

## 开篇引言 (100-150 words)

[选择一种开篇方式]

**Option 1: 问题引入**
[技术名词] 到底解决了什么问题？

如果只看文档，你会觉得它很完美。
但实际项目里，有些坑文档不会告诉你。

这篇文章，从工程视角拆解 [技术名词]。

**Option 2: 场景引入**
你可能遇到过这个场景：

[具体的工程问题描述]

这不是代码问题，而是架构选择的问题。

**Option 3: 观察引入**
这两年，[某个趋势] 越来越明显。

但大部分讨论都在说"是什么"，
很少有人讲"为什么"和"何时用"。

---

## 核心内容部分 (1500-2500 words)

### 一、[第一个核心主题]

[2-4 行段落说明]

**要点 1：**
- [具体内容]
- [具体内容]

**要点 2：**
- [具体内容]
- [具体内容]

[可选：代码示例]
```typescript
// 说明这段代码的目的
export function example() {
  // 实现细节
}
```

💡 **关键洞察：**
[一句话总结核心理解]

---

### 二、[第二个核心主题]

[2-4 行段落说明]

**适用场景：**
✅ 场景 A
✅ 场景 B
❌ 不适合场景 C

**权衡分析：**

| 维度 | 收益 | 代价 |
|------|------|------|
| [维度1] | [收益描述] | [代价描述] |
| [维度2] | [收益描述] | [代价描述] |

[配图：架构图或流程图]

---

### 三、[第三个核心主题]

[2-4 行段落说明]

**常见误区：**

❌ **误区 1：** [错误理解]
✅ **正确理解：** [正确说明]

❌ **误区 2：** [错误理解]
✅ **正确理解：** [正确说明]

⚠️ **踩坑提醒：**
[具体的踩坑经验和避坑建议]

---

### 四、[第四个核心主题]（可选）

[2-4 行段落说明]

**判断标准：**

何时该用 [技术/工具]？

✅ **适合场景：**
- [具体场景 1]
- [具体场景 2]
- [具体场景 3]

❌ **不适合场景：**
- [具体场景 1]
- [具体场景 2]

👉 没有绝对的对错，看场景。

---

## 说人话版总结（可选，100-150 words）

[技术名词] 能干什么？

✅ [核心能力 1]
✅ [核心能力 2]
✅ [核心能力 3]

不能干什么？

❌ [局限性 1]
❌ [局限性 2]

简单说：[一句话精华总结]

---

## 总结 / 写在最后 (100-150 words)

**Option 1: 要点总结**
如果记住三件事：

1. [核心观点 1]
2. [核心观点 2]
3. [核心观点 3]

这篇文章的目的达到了。

**Option 2: 权衡确认**
[技术名词] 不是银弹。

它适合 [场景 A]，但不适合 [场景 B]。
理解这点，比追新更重要。

**Option 3: 行动建议**
如果你想试试 [技术/工具]：

1. 从小范围开始（一个功能模块）
2. 观察实际效果
3. 根据反馈决定是否扩大使用

别一上来就重构整个项目。

---

## 延伸阅读（可选）

📖 **相关资源**
- [官方文档链接]
- [相关博客文章]
- [社区讨论]

---

👨‍💻 **前端之外**
写前端，也拆 AI

#前端工程 #AI落地 #[相关标签]
```

---

## Section-by-Section Writing Guide

### Opening Section (引言)

**Purpose:** Hook reader and set expectations

**Length:** 100-150 words (3-5 paragraphs)

**Key Elements:**
1. Establish the problem/topic
2. Acknowledge reader's likely perspective
3. Promise specific value

**Tone:** Conversational but focused

**Example:**
```markdown
Cursor 和 GitHub Copilot，选哪个？

这不是工具对比文，而是选择逻辑。

因为真正的问题不是"哪个更强"，
而是"在你的场景下，哪个更合适"。

这篇文章，从工程视角拆解两者的差异，
帮你做出理性的判断。
```

---

### Core Content Sections (核心内容)

**Structure:** 2-4 major sections

**Each Section Should Have:**
- Clear subheading
- 2-4 short paragraphs
- Supporting evidence (code, data, examples)
- Visual element (code block, table, or image suggestion)

**Section Flow:**
1. **What** (定义/现象)
2. **Why** (原因/机制)
3. **How** (实践/应用)
4. **When** (判断标准)

**Example Section:**
```markdown
### 二、Cursor 的核心优势：Inline Diff

Cursor 最大的差异化是 inline diff 功能。

**它解决什么问题？**
传统补全只能追加代码，
而 inline diff 可以直接修改现有代码。

**工程价值：**
- 重构场景效率提升明显
- 减少手动调整
- 保持代码上下文一致性

```typescript
// Cursor can suggest modifications like:
-  const [state, setState] = useState(0);
+  const [count, setCount] = useState(0);
```

💡 **关键点：**
这不是"更强的补全"，而是"不同类型的补全"。
```

---

### "说人话版总结" Section (可选)

**Purpose:** Simplify complex technical content

**Use When:**
- Article has dense technical details
- Multiple concepts were introduced
- Reader might be overwhelmed

**Format:**
```markdown
## 说人话版总结

[技术名词] 能干什么？
✅ [简化描述 1]
✅ [简化描述 2]
✅ [简化描述 3]

不能干什么？
❌ [局限描述 1]
❌ [局限描述 2]

简单说：[一句话精华]
```

**Example:**
```markdown
## 说人话版总结

AI 编程工具能干什么？

✅ 写重复代码（省 80% 时间）
✅ 查 API 文档（不用切浏览器）
✅ 智能补全（上下文理解强）

不能干什么？

❌ 做架构决策
❌ 理解业务逻辑
❌ 优化性能瓶颈

简单说：助手，不是架构师。
```

---

### Closing Section (总结)

**Purpose:** Reinforce key takeaways and provide closure

**Length:** 100-150 words

**Choose One Approach:**

**1. Bullet Point Summary** (最常用)
```markdown
## 总结

如果记住三件事：

1. [核心观点 1 - 具体且可执行]
2. [核心观点 2 - 具体且可执行]
3. [核心观点 3 - 具体且可执行]

这篇文章的目的达到了。
```

**2. Trade-off Acknowledgment** (适合技术评估类文章)
```markdown
## 写在最后

TypeScript 不是银弹。

它适合大型项目和长期维护的代码，
但不适合快速原型和一次性脚本。

理解这点，比追新更重要。
```

**3. Actionable Next Steps** (适合实践指南类文章)
```markdown
## 下一步

如果你想试试 Cursor：

1. 从一个小模块开始
2. 观察实际效果（效率 vs 代码质量）
3. 根据反馈决定是否扩大使用

别一上来就全面切换。
```

---

## Content Density Guidelines

### Information per Section

**Opening:** 1 key promise
**Each Core Section:** 1 main point + 2-3 supporting details
**Summary:** 3 key takeaways

### Paragraph Density

**Each paragraph should:**
- Make ONE point
- Be 2-4 lines long
- Lead naturally to next paragraph

**Example of Good Density:**
```markdown
Prompt Engineering 不是调参。

它的本质是接口设计：
定义输入、输出、错误处理。

这么想，就清楚多了。
```

**Example of Too Dense:**
```markdown
❌ Prompt Engineering 涉及多个方面，包括如何设计有效的指令、如何优化上下文窗口的使用、如何处理模型的幻觉问题、如何设计合适的输出格式以及如何进行错误处理和重试机制，这些都是在实际应用中需要仔细考虑的工程问题。
```

---

## Visual Element Placement

### Every Section Should Have ONE of:

1. **Code Block** (for implementation sections)
2. **Table** (for comparisons)
3. **List** (for enumeration)
4. **Image Suggestion** (for architecture/flow)

### Example Distribution in Article:

```
Section 1: Code Block
Section 2: Table (comparison)
Section 3: Image (architecture diagram)
Section 4: List (criteria)
```

---

## Word Count Targets

| Section | Target | Range |
|---------|--------|-------|
| Opening | 120 words | 100-150 |
| Core Content | 1800 words | 1500-2500 |
| Summary | 120 words | 100-150 |
| **Total** | **~2000 words** | **1700-2800** |

**Notes:**
- Code blocks don't count toward word total
- Tables and lists count as ~50% of actual characters
- Aim for quality over hitting exact targets

---

## Quality Checklist

Before considering article complete:

**Structure:**
- [ ] Clear opening that sets expectations
- [ ] 2-4 well-defined core sections
- [ ] Each section has visual element
- [ ] Strong closing with takeaways

**Content:**
- [ ] Every claim is specific and verifiable
- [ ] Trade-offs are discussed, not just benefits
- [ ] Code examples are minimal and purposeful
- [ ] Engineering perspective maintained

**Tone:**
- [ ] ~70% professional, ~30% approachable
- [ ] No anxiety-inducing language
- [ ] No hype or overpromising
- [ ] Honest about limitations

**Formatting:**
- [ ] All paragraphs are 2-4 lines
- [ ] Functional emojis used appropriately
- [ ] Code blocks have language specified
- [ ] Headings create clear hierarchy

**Brand Alignment:**
- [ ] Focuses on "why" and "when"
- [ ] Engineering logic is clear
- [ ] Relatable examples used
- [ ] Maintains "前端之外" voice
