# VPS Runtime Inventory

**状态：部分核实；尚无已验证的完整 VPS Runtime 清单。**

## 已观察主机与 SSH 访问

以下信息于 **2026-10-26 11:48 JST** 通过 SSH 只读观察。该记录证明当时可登录及主机基础身份，不代表服务健康状态或完整资产盘点。

| 字段 | 观察值 |
| --- | --- |
| IPv4 | `160.251.141.110` |
| Hostname | `vm-b54d4b85-fa` |
| OS | Ubuntu 24.04 |
| Architecture | `x86_64` |
| SSH port | `22` |
| SSH login user | `root` |
| Authentication | SSH public key；登录已验证 |
| SSH key fingerprint | `SHA256:N9bxCbhWloJH/srgrJGMR/uvo6RaFz/8Po2Mk0/7x3s` |
| Provider / product ownership / production role | `UNKNOWN` |

专用私钥仅保存在操作员 Mac mini 的 `~/.ssh/vps_access`，不进入此仓库。该主机在操作员本机的 SSH 别名为 `vps`；别名配置不随本仓库分发。

本次仅核实了 SSH 登录和基础主机身份。systemd、Docker/Compose、cron、监听端口、反向代理、运行服务、部署版本及产品归属仍待按 [#14](https://github.com/retailpulses/.github/issues/14) 只读盘点；未知信息不推断为不存在。

依据 [#14](https://github.com/retailpulses/.github/issues/14) 只读识别 VPS 主机、systemd、Docker、cron、监听服务、反向代理及部署版本。实际主机与服务必须现场核实，不能依据历史文档直接标记为运行中。

后续建立 `runtime-inventory.yaml` 与 `runtime-inventory-snapshot.md`；不存储 SSH 密钥、Token 或 Secret。
