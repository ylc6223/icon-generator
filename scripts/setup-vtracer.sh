#!/bin/bash

# VTracer WASM 构建脚本
# 此脚本会克隆 vtracer 仓库并构建 WASM 文件

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WASM_DIR="$PROJECT_ROOT/public/wasm"
VTRACER_DIR="$PROJECT_ROOT/tmp/vtracer"

echo "🔧 VTracer WASM 构建脚本"
echo "========================"

# 检查 wasm-pack 是否已安装
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack 未安装"
    echo "请运行: cargo install wasm-pack"
    exit 1
fi

# 检查 Rust 是否已安装
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo 未安装"
    echo "请访问 https://rustup.rs/ 安装 Rust"
    exit 1
fi

# 创建临时目录
mkdir -p "$PROJECT_ROOT/tmp"

# 克隆 vtracer 仓库（如果不存在）
if [ ! -d "$VTRACER_DIR" ]; then
    echo "📥 克隆 vtracer 仓库..."
    git clone https://github.com/visioncortex/vtracer.git "$VTRACER_DIR"
else
    echo "✅ vtracer 仓库已存在，更新中..."
    cd "$VTRACER_DIR"
    git pull
fi

# 构建 WASM
echo "🔨 构建 WASM..."
cd "$VTRACER_DIR"
wasm-pack build --target web --out-dir pkg

# 创建输出目录
mkdir -p "$WASM_DIR"

# 复制 WASM 文件
echo "📦 复制 WASM 文件到 $WASM_DIR"
cp "$VTRACER_DIR/pkg/vtracer_bg.wasm" "$WASM_DIR/"
cp "$VTRACER_DIR/pkg/vtracer_bg.js" "$WASM_DIR/"
cp "$VTRACER_DIR/pkg/vtracer.js" "$WASM_DIR/"
cp "$VTRACER_DIR/pkg/vtracer.d.ts" "$WASM_DIR/"

echo "✅ 构建完成！"
echo "WASM 文件位置: $WASM_DIR"
echo ""
echo "下一步：在 Vite 配置中添加 WASM 支持"
