#!/bin/bash

echo "🚀 自动配置 GitHub Pages..."

# 使用 gh CLI 配置 Pages
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/wangjiahong/fruit-slice-game/pages \
  -f "source[branch]=gh-pages" \
  -f "source[path]=/"

if [ $? -eq 0 ]; then
    echo "✅ GitHub Pages 配置成功！"
    echo ""
    echo "🌐 您的网站将在几分钟内上线："
    echo "   https://wangjiahong.github.io/fruit-slice-game/"
    echo ""
    echo "💡 以后只需 git push，网站会自动更新"
else
    echo "❌ 自动配置失败，请手动配置："
    echo ""
    echo "1. 访问：https://github.com/wangjiahong/fruit-slice-game/settings/pages"
    echo "2. Source 选择：Deploy from a branch"
    echo "3. Branch 选择：gh-pages / (root)"
    echo "4. 点击 Save"
fi
