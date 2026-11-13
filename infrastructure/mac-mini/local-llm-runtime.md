# Mac mini 本地 LLM 运行记录与 Vision 修复

**记录类型：** Canonical Infrastructure / Runtime Operations，**不是业务规则、模型质量评测或产品 Provider 变更授权**  
**宿主：** `rp-macmini-01`（Mac mini，Apple Silicon；24 GiB 内存）  
**最新现场核查：** 2026-11-13 11:49–12:00 JST，Desktop Commander 直接连接 Mac mini；此前 2026-11-12 GitHub Actions Hygiene 检查  
**代码权属：** [commerce-lab/packages/rp-local-model](https://github.com/retailpulses/commerce-lab/tree/main/packages/rp-local-model)；工具治理 [inbox #281](https://github.com/retailpulses/inbox/issues/281)；基础设施跟踪 [/.github #24](https://github.com/retailpulses/.github/issues/24)  
**资产登记：** [runtime-inventory.yaml](runtime-inventory.yaml)；此文为稳定部署与操作说明，**一次性 PID、健康及负载为下文有日期的观察记录**，不可当作永久配置。  
**证据等级：** fast / vision 短推理 **VERIFIED**；图片批量稳定性、并发、长期资源压力、重启恢复 **NOT VERIFIED**

## 1. 当前双 Runtime 结构（2026-11-13）

| Runtime | 模型/量化 | 监听地址 | 启动与保活 | 能力、状态 |
| --- | --- | --- | --- | --- |
| `rp-local-model-fast-q4` | `qwen3.5:9b` / Q4_K_M | `127.0.0.1:11437` | 已有 wrapper-owned `llama-server`，2 slots、总 32K context。现有生命周期不做改变；启动所属机制仍需核查 | **文本 HEALTHY**；HTTP 200；真实短文本推理成功。服务自报 `modalities.vision=false`，**不可拿来替代 Vision** |
| `rp-local-model-vision-ollama` | `qwen3.5:9b` / Q4_K_M（复用本机模型资产） | `127.0.0.1:11434` | 用户级 LaunchAgent：`com.retailpulses.rp-local-model-vision`，`/opt/homebrew/bin/ollama serve` | **VISION HEALTHY / WRAPPER INFERENCE VERIFIED**。模型仅按请求加载，结束卸载；不会自动改动 fast runtime |
| `rp-local-model-quality-q8` | `qwen3.5:9b-q8_0` / Q8 | `127.0.0.1:11436` | `profiles.json` 中 `enabled=false` | **DISABLED**，这是有意的 Q8 资源策略 |
| `rp-local-model-large` | Q4 / 128K 例外 context | `127.0.0.1:11434` | 同 Ollama 服务，但有 wrapper memory admission | Profile 端点可见并不等于 128K 高内存推理已获验收；不要标记为已验证 |

**调用契约：** 消费者应调用 `rp-local-model infer --profile fast|vision` 而非硬编码端口。Vision 允许受控本地 PNG/JPEG/WebP（最多 4 张、单张至多 6 MiB、总量至多 12 MiB）；`--mode shadow|prepared` 仅产生本地 artifact，无生产写入。Profile 和 guardrails 的源码权属在 commerce-lab；本文件不复制整套配置。

## 2. 2026-11-13 故障、根因与处理

**原始故障：** `rp-local-model health` 中 `vision` / `large` 拒绝连接（`127.0.0.1:11434`）；`fast` 正常，但整体命令 exit 2。用户要求快速恢复 Vision，不改变 fast 服务。

**确认根因：**

1. `profiles.json` 将 vision 指向 `11434`（Ollama API），但该端口此前无 Ollama 常驻服务。
2. 唯一运行的 `11437` 是 `llama-server` 的 text-only 命令；`GET /props` 自报 `modalities.vision=false`。Qwen3.5 manifest 无单独的 projector layer；不能简单把整个模型 blob 当 `--mmproj` 再加载，旧实现已有对应回归测试。**因此将 vision 端口改为 11437 会造成虚假健康/图片输入失败。**
3. Mac mini 24 GiB 内存加已有 Q4 进程，swap 使用很高，**不适合第二份长期驻留的 Qwen**。

**已经执行的最小修复：**

- 保留 `fast` 的 `11437` 实例及现有配置不变。
- 新增用户级 LaunchAgent：
  - 路径：`/Users/agent/Library/LaunchAgents/com.retailpulses.rp-local-model-vision.plist`
  - Label：`com.retailpulses.rp-local-model-vision`
  - `RunAtLoad=true`；`KeepAlive={SuccessfulExit:false}`
  - `ProgramArguments=[/opt/homebrew/bin/ollama, serve]`
  - 环境 `OLLAMA_HOST=127.0.0.1:11434`；`OLLAMA_KEEP_ALIVE=0`；`OLLAMA_NUM_PARALLEL=1`；`OLLAMA_MAX_LOADED_MODELS=1`；`OLLAMA_NO_CLOUD=1`
  - 日志：`~/Library/Logs/Retailpulses/rp-local-model-vision.{out,err}.log`
- 检查 `plutil -lint` 通过；`launchctl bootstrap gui/502` 成功，`launchctl print` 显示运行中；`/api/tags` 返回 HTTP 200，列出具备 `vision` capability 的 `qwen3.5:9b`。实际 model load 仅在图片请求时执行，返回后卸载。
- 为使 `OLLAMA_NO_CLOUD=1` 生效，重新加载 LaunchAgent 时首次 bootstrap 过快返回 `5 Input/output error`，在旧进程完全退出后再次 bootstrap **成功**。该短暂恢复失败已处理，不代表持续运行故障。

**回滚操作（仅出现异常时由有权限的运维执行）：** `launchctl bootout gui/$(id -u)/com.retailpulses.rp-local-model-vision`；确认 11434 不再监听；保留或撤除新 plist 需核对消费者。fast/Q4 `11437` 不受此操作影响。不将回滚扩展为关闭其他 Ollama 服务或删除模型。

## 3. 实际验收证据

| 时间 / 方法 | 结果 | 证据边界 |
| --- | --- | --- |
| 2026-11-13 11:19，fast `GET /health` | HTTP 200 / `status:ok` | 仅端口与服务 |
| 2026-11-13 11:19–11:21，fast `POST /completion` | 合成无业务文本，输出 `READY`，约 0.36s | 只验证短文本 |
| 2026-11-13 11:57，Vision Ollama `POST /api/generate` | 48×48 合成红色 PNG，`think=false`；HTTP 200，输出 `red`，约 3.48s | 只验证单图/短回答；第一次未设置 `think=false` 的测试正文为空，应避免将 HTTP 200 当有效生成 |
| 2026-11-13 11:58，`rp-local-model infer --profile vision --mode shadow` | 同类合成红图，**exit 0 / COMPLETED**，返回 `Red`；约 8.81s；`production_write=false` | **真实 wrapper 端到端验证通过**；非客户数据/非业务图 |
| 2026-11-13 11:58，LaunchAgent 重载后 | `launchctl` running、11434 LISTEN、Ollama model tags HTTP 200；`vision` profile `healthy=true`；fast 11437 `/health` 仍为 HTTP 200 | 配置加载成功；重启后尚未重复完整图片 inference；机器重启后的启动行为尚未实测 |

在成功推理之后，`ollama ps` 显示 **没有已加载的模型**，对应 `OLLAMA_KEEP_ALIVE=0` 策略；此结果是请求结束后的现场观察，而非保证未来任何负载都不会产生临时峰值。

## 4. 资源与安全边界

- 2026-11-13 11:20，fast `llama-server` 物理内存 footprint **15.0 GiB**（peak 16.9 GiB）；24 GiB 主机 swap 使用约 **17 GiB**。
- 2026-11-13 11:57 同时加载 Vision 的短测试期间，swap 使用一度达到约 **25 GiB**，表明双模型并存存在明显的 **内存/性能风险**。模型卸载后 swap 不一定立即下降，不能用单次 `memory_pressure` free% 替代全局稳定性评估。
- Vision 只绑定 `127.0.0.1`，`OLLAMA_NO_CLOUD=1`；无需外部模型服务，也没有新增公网端点。
- **当前可用不代表适宜高频批量图像推理**。在完成内存峰值、并发/超时、长稳与异常降级测试前，将 Vision 视作低频受控能力。No-LLM 规则仍用于图片大小过滤/可用性和 CSV 导出，Vision 不是硬依赖。
- 请不要把模型存在、port health 或 schema 合法率当成商品视觉判断准确率；真实 listing 图片质量还需对照人工 gold set 与 Mercari 导入结果。

## 5. 运行检查（只读）

```sh
# 主服务
curl --max-time 3 http://127.0.0.1:11437/health
curl --max-time 3 http://127.0.0.1:11437/props

# Vision 接口及已配置模型
curl --max-time 3 http://127.0.0.1:11434/api/tags
OLLAMA_HOST=127.0.0.1:11434 /opt/homebrew/bin/ollama ps

# 按调用能力分别判定；整体 exit 2 可能只因 quality disabled / large 不可用
/Users/agent/work/commerce-lab/packages/rp-local-model/rp-local-model health

# 注册的服务、资源
launchctl print gui/$(id -u)/com.retailpulses.rp-local-model-vision
sysctl vm.swapusage
memory_pressure
```

**运维变更复核触发：** 服务频繁重启、Vision 图片推理返回空输出、Q4 长时间无响应、swap 持续恶化、启动时占用 11434、model tag/量化或 image input contract 变化。记录时间戳和最小可复现证据，并回写 [/.github #24](https://github.com/retailpulses/.github/issues/24)。不要把临时 PID、客户图片或提示词写进公共 GitHub。
