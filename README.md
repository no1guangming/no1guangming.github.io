# 獨孤求敗 · 个人博客

基于 [Jekyll](https://jekyllrb.com) 构建、部署在 GitHub Pages 上的个人站点（域名 `no1guangming.github.io`）。主题派生自 Jekyll Metro，已做大量定制与优化。

## 技术栈

- **静态站点生成**：Jekyll（GitHub Pages 自动构建）
- **评论系统**：[utterances](https://utteranc.es)（基于 GitHub Issues，无需任何密钥，纯静态安全）
- **站内搜索**：jekyll-search（客户端 `search.json` 索引）
- **随机背景**：首页从 `assets/images/bcg1~4.jpg` 随机选取，通过 CSS 变量注入，无阻塞、无 FOUC
- **图片灯箱**：Magnific Popup
- **图标**：iconfont（内嵌 woff2，含 eot/ttf 兜底）

## 本地构建

```bash
# 安装依赖（首次）
bundle install

# 本地预览（默认 http://127.0.0.1:4000）
bundle exec jekyll serve

# 仅构建产物到 _site/
bundle exec jekyll build
```

> 依赖见 `Gemfile`：`jekyll`、`jekyll-paginate`、`jekyll-sitemap`。

## 目录结构

```
_config.yml         站点配置（标题、导航、分页、插件）
_includes/          可复用片段（head / 侧边栏 / 评论 / 诗词 等）
_layouts/           页面骨架（master / post / page）
_posts/             博客文章（Markdown，含 front matter）
assets/             CSS / JS / 图片 / 字体
search/            站内搜索页
about/ resume/      关于 / 简历页
blog/ tags/ archive/ 博客列表 / 标签 / 归档
```

## 优化记录

- 升级 jQuery 1.11.2 → 3.7.1，Magnific Popup 升级至 1.2.0
- 移除未使用的 MetroJs（约 146KB）与 iconfont 演示死代码
- 全站脚本加 `defer`，背景图经 Pillow 压缩（约 70% 体积下降）
- 评论从 Gitalk 迁移至 utterances（去除公开仓库中的 OAuth clientSecret）
- 删除手写 `sitemap.xml`，交由 `jekyll-sitemap` 生成合规绝对 URL
- 补齐 `lang` / `canonical` / Open Graph、`viewport` 去缩放锁
- 修复搜索页回车空查询跳 `/undefined` 的 bug
- 旧文 `http://` 图片统一升级为 `https://`，消除混合内容

## License

原主题基于 [MIT License](LICENSE.md) 开源；本站定制内容版权归作者所有。
