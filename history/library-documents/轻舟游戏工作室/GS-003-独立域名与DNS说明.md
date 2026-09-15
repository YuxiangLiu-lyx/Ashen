# GS-003 独立域名与DNS说明

记录日期：2026-09-10。老板指定的完整域名为 **ashen-vow-qingzhou.com**。

托管端已建立待验证绑定，ID为 `appgdom_6aa2055374ac8191ab3cd263bdbda30c`，状态为 **pending**。本记录不代表域名已经注册、已付款、DNS已配置或网址已经可访问；这些均无已完成证据。当前仍保留[原公开试玩地址](https://ashen-vow-qingzhou.chickchickman4.chatgpt.site)。

在实际拥有该域名并能管理DNS后，需填写以下记录。值按托管端返回内容逐字保留：

| 类型 | 主机名 | 值 |
|---|---|---|
| A | `@` | `162.159.143.30` |
| A | `@` | `172.66.3.26` |
| TXT | `_openai-site-verification` | `openai-site-verification=l9rh-j_ofI08sdOaP2OqK96mI5KmVuc6m0Hv2MfdCas` |
| TXT | `_cf-custom-hostname` | `e060c8e2-97a1-41e7-8de8-aa5d55ffe997` |

`@`表示域名根部。TXT值中的 `openai-site-verification=` 是值的一部分，不能删掉。不同DNS服务商可能自动补全域名，填写主机名时避免重复附加 `.ashen-vow-qingzhou.com`。不在尚未知晓的注册商账号里凭空声称配置完成。

DNS写入后需重新查询托管端验证状态，并实际检查HTTPS访问；pending解除前不将.com作为已生效试玩链接宣传。没有注册商、注册费或续费交易证据，本轮域名现金支出仍为0。

换域名会切换浏览器存储空间。V6提供显式存档导出/导入：在旧站导出并复制保存完整文本，待新站实际可用后粘贴导入。它不自动同步两个网址，也不要求删除旧站存档。

最近核查：2026-09-10T01:44:01.583926+00:00。域名pending，提供商pending，证书pending_validation。未写入DNS，未进行.com HTTPS实访；以上记录等待实际域名所有者配置。
