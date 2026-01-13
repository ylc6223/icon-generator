# Emoji Guide: Functional Emoji Library

> Approved emojis for technical content in WeChat articles

---

## Core Principle

**Emojis serve function, not decoration**

✅ Use emojis to:
- Improve scannability
- Signal content type
- Guide visual navigation
- Add structure clarity

❌ Don't use emojis to:
- Express emotion
- Decorate headings unnecessarily
- Replace actual words
- Create visual noise

---

## Approved Emoji Library

### Navigation & Direction

**👉 Pointer/Direction**
```markdown
Use for:
- Calling attention to key points
- Directing to next section
- Highlighting action items

Examples:
👉 核心要点：理解本质，而非追新
👉 下一步：从小范围开始试验
```

**📌 Pin/Important Note**
```markdown
Use for:
- Marking critical information
- Sticky notes or reminders
- Important prerequisites

Examples:
📌 注意：这个方法仅适用于 Node.js 环境
📌 前置条件：需要 TypeScript 4.5+
```

---

### Status & Validation

**✅ Correct/Recommended**
```markdown
Use for:
- Best practices
- Recommended approaches
- Things to do
- Positive examples

Examples:
✅ 用 AI 工具提升效率
✅ 小范围试验，观察效果
✅ 详细的类型标注
```

**❌ Incorrect/Avoid**
```markdown
Use for:
- Anti-patterns
- Things to avoid
- Common mistakes
- Negative examples

Examples:
❌ 用 AI 工具替代思考
❌ 一上来就全面重构
❌ 过度复杂的类型体操
```

**⚠️ Warning/Caution**
```markdown
Use for:
- Warnings
- Potential pitfalls
- Things requiring attention
- Edge cases

Examples:
⚠️ 注意：AI 生成的代码需要仔细 review
⚠️ 这个方法在大型项目中可能有性能问题
⚠️ 确保在生产环境测试过再上线
```

---

### Thinking & Insight

**🤔 Think About This**
```markdown
Use for:
- Thought-provoking questions
- Encouraging reflection
- Pause points

Examples:
🤔 为什么会这样？
🤔 你的项目真的需要这个吗？
```

**💡 Key Insight/Light Bulb**
```markdown
Use for:
- Aha moments
- Core insights
- Mental models
- Conceptual breakthroughs

Examples:
💡 Prompt Engineering = API 接口设计
💡 关键洞察：不是工具问题，是场景问题
```

---

### Investigation & Analysis

**🔍 Deep Dive/Examine**
```markdown
Use for:
- Detailed analysis sections
- Investigation results
- Close examination

Examples:
🔍 深入分析：RSC 的渲染机制
🔍 让我们仔细看看这个实现
```

**📊 Data/Stats**
```markdown
Use for:
- Performance metrics
- Benchmarks
- Statistical data

Examples:
📊 性能对比：Vite vs Webpack
📊 实测数据：编译时间降低 60%
```

---

### Highlight & Emphasis

**⭐ Star/Highlight**
```markdown
Use for:
- Special highlights
- Standout features
- Recommendations

Examples:
⭐ 推荐：优先考虑这个方案
⭐ 核心特性：零配置开箱即用
```

**🎯 Target/Goal**
```markdown
Use for:
- Objectives
- Goals
- Target outcomes

Examples:
🎯 目标：提升 50% 开发效率
🎯 核心诉求：简化配置流程
```

---

### Resources & References

**📖 Book/Documentation**
```markdown
Use for:
- Documentation links
- Further reading
- Reference materials

Examples:
📖 延伸阅读：React 官方文档
📖 参考资料：TypeScript Handbook
```

**🔗 Link/Connection**
```markdown
Use for:
- Related articles
- External links
- Cross-references

Examples:
🔗 相关文章：《理解 Hooks 的本质》
🔗 参考实现：GitHub 仓库
```

---

### Tools & Technology

**🛠️ Tools/Utilities**
```markdown
Use for:
- Tool mentions
- Utility sections
- Technical setup

Examples:
🛠️ 推荐工具：Cursor, Copilot
🛠️ 开发环境配置
```

**⚙️ Settings/Configuration**
```markdown
Use for:
- Configuration sections
- Settings explanations
- Setup instructions

Examples:
⚙️ 配置说明：tsconfig.json
⚙️ 环境变量设置
```

---

### Progress & Process

**✨ New/Special**
```markdown
Use sparingly for:
- Truly new features
- Special announcements
- Unique capabilities

⚠️ Avoid overuse - this is NOT a decorative emoji

Examples:
✨ 新特性：Inline Diff 模式
✨ 独特能力：多文件编辑
```

**🚀 Launch/Fast**
```markdown
Use very sparingly for:
- Performance improvements
- Speed mentions
- Quick starts

⚠️ Avoid "效率起飞" type usage

Examples:
🚀 快速开始指南
🚀 性能提升 3 倍
```

---

## Usage Patterns

### Checklist Pattern

```markdown
部署前检查：

✅ 代码已通过 review
✅ 测试覆盖率达标
✅ 性能指标符合预期
❌ 未进行生产环境测试
❌ 文档尚未更新
```

### Comparison Pattern

```markdown
Cursor vs Copilot：

**Cursor 优势：**
✅ Inline diff 体验好
✅ Multi-file editing
✅ Composer 模式强大

**Copilot 优势：**
✅ IDE 集成深度
✅ 生态更成熟
✅ 企业支持完善
```

### Warning Pattern

```markdown
⚠️ **踩坑提醒**

使用 AI 工具时需要注意：

1. 生成的代码必须 review
2. 复杂逻辑容易出错
3. 安全相关代码要特别谨慎
```

### Insight Pattern

```markdown
💡 **关键理解**

Prompt Engineering 的本质：

不是调参数，而是设计接口。
把它当成 API 设计来思考，就清楚了。
```

### Action Item Pattern

```markdown
👉 **下一步行动**

如果你想试试 Cursor：

1. 从一个小模块开始
2. 观察实际效果
3. 根据反馈调整
```

---

## Emojis to AVOID

### Emotional Emojis

```
❌ 😂 🤣 😭 😱 🥺
❌ 😍 🥰 😎 🤩 🤗
❌ 😤 😡 🤬 😢 😥
❌ 🙏 💪 👍 👏 🔥
```

**Why:** Too informal, don't fit engineering content tone

### Decorative Emojis

```
❌ 🌟 ✨ 🎉 🎊 🎈
❌ 💫 ⚡ 🌈 🎯 🏆
❌ 💎 👑 🎁 🎀 🌸
```

**Why:** Pure decoration, add no functional value

**Exception:** ✨ and 🎯 are allowed in LIMITED functional contexts (see approved list above)

### Random Object Emojis

```
❌ 🍕 ☕ 🍺 🎮 🏀
❌ 🐱 🐶 🦄 🌮 🍔
```

**Why:** Irrelevant to technical content

---

## Frequency Guidelines

### Per Article

**Maximum Recommended:**
- Total emojis: 20-30
- Unique emoji types: 5-8
- Emojis per paragraph: 0-1

**Distribution:**
- Section headers: 0-1 emoji
- Bullet points: 1 emoji per item (if using pattern)
- Paragraphs: Sparingly, only when functional

### Good vs Excessive

**✅ Good Usage:**
```markdown
## Cursor 的核心优势

✅ Inline diff 体验优秀
✅ Multi-file editing 强大
⚠️ 但学习曲线较陡

💡 关键点：适合重构场景
```

**❌ Excessive Usage:**
```markdown
## 🔥 Cursor 的核心优势 ✨

✅ 💪 Inline diff 体验超级优秀 👍
✅ 🚀 Multi-file editing 非常强大 ⭐
⚠️ 😅 但学习曲线较陡 📈

💡 ✨ 关键点：适合重构场景 🎯 👉
```

---

## Context-Specific Usage

### Code Examples

**Before code block:**
```markdown
💡 这个 Hook 的设计思路：

```typescript
// Code here
```
```

**After code block:**
```markdown
```typescript
// Code here
```

✅ 关键点：保持接口简单
```

### Lists

**Enumeration:**
```markdown
AI 工具的核心价值：

1. 减少重复劳动
2. 即时文档查询
3. 上下文代码补全
```

**Checklist:**
```markdown
部署前确认：

✅ 测试通过
✅ 代码已 review
❌ 未进行压力测试
```

**Pros/Cons:**
```markdown
✅ 优点：开发效率提升明显
❌ 缺点：需要仔细 review 生成的代码
```

### Callouts

**Warning Box:**
```markdown
⚠️ **注意事项**

在生产环境使用 AI 工具时：
- 必须进行完整的代码审查
- 关键逻辑需要人工验证
- 安全相关代码尤其谨慎
```

**Tip Box:**
```markdown
💡 **提示**

使用 Cursor 的最佳实践：
- 明确描述你的需求
- 用工程语言表达
- 分步骤验证结果
```

---

## Mobile Optimization

**Important:** Emojis can render differently on mobile devices

**Best Practices:**
- Test on WeChat mobile preview
- Avoid emoji combinations (can break on some devices)
- Stick to commonly supported emojis
- Don't rely on color variations

**Safe Emojis (Universal Support):**
- ✅ ❌ ⚠️ 👉 💡 🤔 📌 🔍 📖 🛠️

**Use Cautiously (May Vary):**
- ⭐ ✨ 🚀 🎯 ⚙️ 📊

---

## Accessibility Considerations

**Screen Reader Compatibility:**
- Emojis should enhance, not replace, text meaning
- Critical information should never be emoji-only
- Use emojis as visual aids, not primary content

**Example:**

**✅ Good (Text is complete):**
```markdown
✅ 推荐做法：使用 TypeScript 严格模式
```

**❌ Bad (Emoji replaces meaning):**
```markdown
✅ TypeScript 严格模式
(Unclear whether this is recommended or just mentioned)
```

---

## Quick Reference

**Most Used (80% of usage):**
- ✅ Correct/Yes
- ❌ Incorrect/No
- ⚠️ Warning
- 💡 Insight
- 👉 Direction

**Occasional Use (15% of usage):**
- 📌 Important note
- 🤔 Think about
- 🔍 Examine
- 📖 Reference
- 🛠️ Tools

**Rare Use (5% of usage):**
- ⭐ Highlight
- ✨ Special
- 🎯 Goal
- 📊 Data
- ⚙️ Settings

---

## Testing Checklist

Before publishing, verify emoji usage:

- [ ] All emojis serve a functional purpose
- [ ] No emotional or decorative emojis used
- [ ] Emoji frequency is moderate (20-30 per article)
- [ ] Text meaning is complete without emojis
- [ ] Emojis enhance scannability
- [ ] Pattern usage is consistent (e.g., ✅/❌ for checklists)
- [ ] Mobile rendering has been previewed
