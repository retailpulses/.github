# VPS Runtime Inventory

**状态：已完成一轮只读 Runtime 盘点；服务归属、若干源仓库及部分外部依赖仍显式标为 `UNKNOWN`。**

本目录的机器可读 Runtime Registry 为 [`runtime-inventory.yaml`](runtime-inventory.yaml)，对应的现场记录为 [`runtime-inventory-snapshot.md`](runtime-inventory-snapshot.md)。本次盘点属于 [Issue #14](https://github.com/retailpulses/.github/issues/14) 的 VPS 范围，不表示 Cloudflare 范围也已完成。

## 文件与覆盖范围

- `runtime-inventory.yaml`：主机身份、业务与基础设施服务、systemd timers、root crontab 作业、代码/发布引用及已知端口。
- `runtime-inventory-snapshot.md`：带时间戳的 systemd 状态、最近 oneshot 退出结果、监听端口、防火墙、反向代理、已禁用 timers、失败项及核验边界。
- 记录的是当前观察到的配置和运行状态；PID、计时器下次运行时间、one-shot 结果会变化，须以新 snapshot 更新。

## 观察边界

本次通过 SSH 对主机进行只读核验。没有读取环境变量或密钥值、日志正文、业务数据，也没有访问 Supabase 或其他外部数据端点。带凭据的环境文件只记录“主机配置引用存在”，不会写入仓库。服务 exit code 为 0 只证明 systemd 记录的进程退出结果，不等同于业务验收或数据正确性。

该仓库为公开仓库；不得加入私钥、Token、密码、环境变量值、日志/客户数据或 Cloudflare Tunnel 凭据配置。代码源、产品归属、部署 SHA、数据端点和健康状态不能由路径或服务名称推断；证据不足时保留 `UNKNOWN`。

## 刷新

从已授权的操作员 Mac mini 使用 `ssh vps`，只读核对 `systemctl list-units`、`systemctl list-timers`、`systemctl list-unit-files`、root `crontab -l`（只记录计划与入口，不复制凭据参数）、`ss -lntup`、`ufw status`、Nginx 的安全路由指令、活动进程工作目录、release symlink 和 source checkout HEAD。禁止把此清单刷新操作扩展为部署、重启、恢复、清理、timer/cron 修改或凭据轮换；此类改变须另有明确授权。
