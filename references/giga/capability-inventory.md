# REF-GIGA-CAPABILITY — GigaB2B Canonical Capability Registry

Status: **Curated reuse decisions / PR review** · Owner: Engineering Registry · Reviewed: 2026-10-30 · [Scope #53](https://github.com/retailpulses/.github/issues/53)

本页是推荐复用入口，只登记经过比较、有明确适用范围的优选能力；不是发现清单、历史索引或Runtime认证。“推荐”限于表中函数/职责，不代表整个模块优选、所有业务规则已实现或可以直接执行生产任务。同一职责只保留一个推荐来源；互补职责分开，不能登记为两个竞争实现让消费者自行猜测。

业务规则唯一来源：[Giga内容预处理](../../business/giga-content-preprocessing.md)。API契约见[Open API 2.0](open-api-2.0.md)，字段映射见[Data Dictionary](data-dictionary-mapping.md)。不在registry复制译词表、业务规则或平台数值上限。比较理由、被替代实现与发现清单保留在[PR #67](https://github.com/retailpulses/.github/pull/67)，后续问题见[#66](https://github.com/retailpulses/.github/issues/66)。

<a id="giga-content-preprocessing-assets"></a>
## 推荐复用：Giga内容预处理

| 能力 / 唯一推荐来源 | 选择依据及范围 | 消费方式与明确限制 |
| --- | --- | --- |
| **GIGA-CONTENT-A02：确定性译词与规格清洗** · commerce-lab · [canonical_copy_preprocess.py](https://github.com/retailpulses/commerce-lab/blob/883d996eec56bb5ed5e8366fd9a1d8a10018e139/apps/mercari/local_offer/canonical_copy_preprocess.py) | COPY-002/005；采用translate_value、SPEC_LABELS和布局清洗/规格解析中已验证行为。相同规格输入下，旧Reset可将Indoor、Classic,Cute日文化并生成单一颜色项；当前NPL会原样输出英文并产生重复颜色，不能作为该职责的推荐来源 | **Copy & Adapt最小纯函数及fixtures**到消费者既有预处理边界，保留固定源SHA；不直接采用整个build_source_pack。映射需按业务语义核对；旧Location标签未翻译，词表也有重复键，不能整表无审查复制。精确label/value去重仅作局部步骤，不能冒充跨来源语义去重 |
| **GIGA-CONTENT-A04：来源可追溯的文案计划与当前标题组装** · store-ops · [reset_pipeline.py](https://github.com/retailpulses/store-ops/blob/658eff7f31cc0d50f2351a6dde8d9ee5935deab2/apps/mercari/new-products-to-listing/meta_builder/reset_pipeline.py) | COPY-001/003/008；采用source-addressable计划/覆盖记录和#248已harvest的标题流程；优于把旧pack的fact_key覆盖和数组长度启发式当作多来源权威。该选择不覆盖规格翻译/语义去重 | **沿用NPL产品内消费入口**；其他产品先适配自身事实契约，不直接导入其provider/运行时。把A02适配进确定性预处理，并保留所有支持来源。#252未修复，当前realize_plan/render_description的原样规格输出不属于优选行为；不启动旧整套Reset生成器 |
| **GIGA-CONTENT-A05：缺来源时的Canonical回源边界** · commerce-lab · [canonical_image_origin.py](https://github.com/retailpulses/commerce-lab/blob/dd4cdad2d28300433cae488431ca2fa874de4400/apps/mercari/local_offer/canonical_image_origin.py) | IMG-001；由Canonical owner取得供应商来源并接续事实，消费产品不复制Live API client或各写主库。选择的是已存在的owner边界；未做多实现性能比较，也未证明缺图恢复E2E | **通过既有Owner接口消费**；fetch_image_origin是代码定位入口，不是授权运行命令。沿用Open API 2.0契约；本轮未触发API或写库 |
| **GIGA-CONTENT-A06：原图检查、内容去重与资产登记** · commerce-lab · [image_set_prepare_worker.py](https://github.com/retailpulses/commerce-lab/blob/dd4cdad2d28300433cae488431ca2fa874de4400/apps/mercari/local_offer/image_set_prepare_worker.py) | IMG-001/002；采用inspect_source、unique_sources、upsert_asset_metadata原图职责，维护hash、实际metadata和绑定；优于在发布消费者重复做来源登记。此为Owner复用选择，不代表所有worker行为已验收 | **通过Canonical owner消费**，不复制worker到NPL。只推荐原图检查/登记；排除#253涉及的repair来源基线关联和accept流程。master_source/external_reference不是平台衍生交付图；30MiB内存保护不是平台上限 |

以上四项是互补职责，不是四套完整预处理管线。A01/A03/A07/A08/A09不再作为推荐资产列项；旧ID不复用，其历史含义与退出理由见PR比较记录。

## 尚无合格推荐的能力

以下仅声明覆盖边界，不是候选资产列表；缺口在原Issue维护。

- **COPY-004：完整语义去重与冲突保全**：旧Reset精确去重会丢失部分多来源信息；当前NPL来源追踪较好，但没有完成归一化后的语义去重。组合适配目标已确定，尚无满足全部要求的单一实现。[#252](https://github.com/retailpulses/store-ops/issues/252)
- **IMG-003/006：metadata repair后来源基线与accept一致性**：当前source_sort_review存在“最新repair请求代替原始manifest”缺陷，不推荐照搬。[#253](https://github.com/retailpulses/store-ops/issues/253)
- **IMG-004/005/006：平台profile、衍生交付与完整bytes预检**：原图登记、public_url/source_url回退或首1KB签名探测均不满足完整交付契约；尚无已证明接通的推荐实现。[#254](https://github.com/retailpulses/store-ops/issues/254)
- **通用Open API client / 同步 / 下单脚本**：此前只完成代码发现，未完成候选比较，不能授予canonical实现地位。发现记录已移至PR #67；继续在[#53](https://github.com/retailpulses/.github/issues/53)比较后按职责选入。此处不否定各产品现有运行，只是不为未经比较的代码背书。

## 验证与更新

- 固定比较基线：旧Reset源883d996eec56bb5ed5e8366fd9a1d8a10018e139；局部离线行为核实Lab dd4cdad2d28300433cae488431ca2fa874de4400；NPL 658eff7f31cc0d50f2351a6dde8d9ee5935deab2。证据见[调查PR #255](https://github.com/retailpulses/store-ops/pull/255)及PR #67。没有完整模型、Live API、图片写入或生产发布验收；不声明当前部署状态。
- 采用推荐能力时，在Owner现有测试中验证相同输入下的事实保真、日文化/去重、来源追踪和异常；图片另核对hash/绑定/顺序与幂等。37/70个现有测试通过及4项坏行为复现通过，都不能证明上述缺口已修复。
- 新实现只有在同职责比较中证明更好，且不回退既有事实/来源/幂等行为，才替换本页推荐；**替换而非追加并列候选**。理由、比较输入输出、源SHA和测试结果保存在变更PR；本页仅更新胜出入口、适用范围和限制。无充分证据时保留覆盖缺口，不制造赢家。
- 凭据只按[Credential Registry](../../infrastructure/credentials/README.md)和[Access Guide](../../infrastructure/credentials/ACCESS_GUIDE.md)查找。Runtime以[基础设施登记](../../infrastructure/mac-mini/README.md)为准，不在本页重复维护部署清单。Open API 1.0已退役，不选用旧OAuth/Bearer路径。
