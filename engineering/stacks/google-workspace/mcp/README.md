# google-workspace / mcp —— 安装与授权

本目录只放 **DSH 侧接入配置**，不含上游代码，也不含任何凭据。
前置：[栈记录](../README.md) · [设计](../design.md)

## 0. 最小路径

```bash
export WORKSPACE_MCP_DIR="$HOME/Documents/deepseek-harness/default-workspace/google-workspace-mcp"
mkdir -p "$WORKSPACE_MCP_DIR"/{credentials,logs}
python3 -m venv "$WORKSPACE_MCP_DIR/.venv"
"$WORKSPACE_MCP_DIR/.venv/bin/pip" install -U workspace-mcp
```

把 [`cordis.patch.yml`](cordis.patch.yml) 的 `insert` 块合入 `~/.dsh/profiles/<profile>/cordis.patch.yml`，
替换占位符后重启 DSH。到此 server 会被拉起，但**所有 Google 工具仍会失败**，直到第 2、3 步完成。

## 1. Google Cloud 项目与 API

1. <https://console.cloud.google.com/projectcreate> 建项目。
2. 在 APIs & Services → Library 启用实际要用的 API：

   | 用途 | API |
   |---|---|
   | Drive | `drive.googleapis.com` |
   | Docs / Sheets / Slides | `docs`、`sheets`、`slides` 各一个 |
   | Gmail / Calendar（可选） | `gmail`、`calendar-json` |

   未启用的 API 会让对应工具返回 `accessNotConfigured`，与授权无关。

## 2. OAuth 同意屏

<https://console.cloud.google.com/auth/overview> → **Get started**：

| 字段 | 说明 |
|---|---|
| App name | 例如 `DSH Drive` |
| User support email | 账号邮箱 |
| Audience | **Workspace 成员可选 `Internal`；普通 Google 账号只能 `External`** |
| Contact email | 账号邮箱 |
| 政策勾选 | 必须同意 |

`External` + `Testing` 时必须把使用者加进 **Test users**，否则授权被拒（`access_denied`）。
`Testing` 下 refresh token **每 7 天过期**——想永久解决见第 5 步。

## 3. OAuth 客户端

<https://console.cloud.google.com/auth/clients/create>：

1. Application type 选 **Desktop app**（不要选 Web，Desktop 允许任意回环端口）。
2. Create → **Download JSON**。
3. 保存并收紧权限：

```bash
mv ~/Downloads/client_secret_*.json "$WORKSPACE_MCP_DIR/client_secret.json"
chmod 600 "$WORKSPACE_MCP_DIR/client_secret.json"
```

## 4. 授权

调用任意一个 Google 工具即可触发。stdio 模式下 server 会**自动打开浏览器**：

1. 若出现 "Google hasn't verified this app" → **Go to DSH Drive (unsafe)**（未提交验证的必然提示）。
2. 选择账号 → 全选权限 → Continue。
3. 回调落在 `http://localhost:8000/oauth2callback`，显示 "Authentication Successful"。
4. token 写入 `$WORKSPACE_MCP_DIR/credentials/<email>.json`，重试工具调用即成功。

> 工具返回 `**ACTION REQUIRED** ... Authorization URL` **不是故障**：它是把授权链接交给调用方的设计，
> 方便在无法自动开浏览器的环境里手动完成。

**端口冲突**：回调固定 `127.0.0.1:8000`。被占用时先释放：

```bash
lsof -nP -iTCP:8000 -sTCP:LISTEN
```

## 5. 去掉 7 天过期（发布 production）

`External` 应用发布到 production 后 refresh token 不再按 7 天过期。发布本身不需要验证，但有两个代价：
授权页仍显示未验证警告；项目有 **100 用户终身上限**（自用无影响，不能当组织共享凭据）。

发布前必须先在 **Branding** 页补全，否则 Publish 按钮保持 disabled 且**不会告诉你缺哪一项**：

| 字段 | 是否必需 | 备注 |
|---|---|---|
| App name / support email / developer contact | 是 | 首次配置时已填 |
| **Application privacy policy link** | **是（实测门槛）** | 必须是公开可达的真实页面，不能是登录后可见或占位 URL |
| Application home page | 建议 | 与隐私政策同域更稳 |
| Authorized domains | 填了就生效 | 与上面 URL 的域名一致 |

补全并 Save 后，`Audience` 页的 **Publish app** 变为可点击 → **Push to production** → Confirm。
发布完成后建议删一次 `credentials/<email>.json` 重新授权，确保拿到 production 签发的 refresh token。

## 6. 排障

| 现象 | 原因 | 处置 |
|---|---|---|
| `OAuth client credentials not found` | `GOOGLE_CLIENT_SECRET_PATH` 指向的文件不存在 | 检查路径与 `chmod 600` |
| 授权后仍报需要授权 | 回调没到达（端口占用/浏览器拦了 localhost） | 释放 8000，重试 |
| `accessNotConfigured` | 该 API 未在项目启用 | Library 里启用 |
| `notACalendarUser` / `Mail service not enabled` | 账号本身没有该服务 | 无法修复；换服务或换账号 |
| `insufficientPermissions` | token 的 scope 不含该工具 | 改回更宽的 `--tools` 后删 token 重授权 |
| 每 7 天失效一次 | 应用仍在 `Testing` | 见第 5 步 |
| Publish 按钮灰 | Branding 缺字段（最常见是 privacy policy） | 见第 5 步 |

## 7. 维护

```bash
# 升级上游
"$WORKSPACE_MCP_DIR/.venv/bin/pip" install -U workspace-mcp   # 之后重启 DSH

# 强制重新授权
rm "$WORKSPACE_MCP_DIR/credentials/<email>.json"

# 看日志
tail -f "$WORKSPACE_MCP_DIR/logs/mcp_server_debug.log"
```

**不要提交**：`client_secret.json`、`credentials/`、`.venv/`、`logs/`。本目录的 [`.gitignore`](.gitignore) 已覆盖。
