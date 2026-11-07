/* ==========================================================
   本文件自动生成，请勿手改。
   改内容请编辑 projects/<项目名>/info.json，
   然后重新运行「刷新列表.ps1」。
   生成时间：2026-11-07 16:36:01
   ========================================================== */

window.PROJECTS =[
    {
        "id":  "01-工业运维智能Agent原型",
        "title":  "工业运维智能 Agent 原型",
        "subtitle":  "AI 应用实战项目 · 对话式故障诊断",
        "period":  "2026.05 – 2026.09",
        "role":  "独立开发（原型）",
        "tags":  [
                     "Python",
                     "DeepSeek API",
                     "RAG 检索增强",
                     "工具调用",
                     "Prompt 工程"
                 ],
        "summary":  "仓储运维长期依赖人工巡检和经验判断，故障发现滞后、排查效率低，运维知识又分散在手册里难以即时调用。为此开发了一款面向仓储运维场景的轻量级 AI Agent 原型：一句话提问，它自己去读传感器、查知识库、做风险研判，最后给出处置步骤并可以直接生成工单。项目可在本地一条命令跑起来，没有 API key 时走离线规则引擎，配上 key 就切到 DeepSeek。",
        "highlights":  [
                           "基于 Python 与 DeepSeek 大模型 API 搭建 Agent 框架，设计对话记忆、意图识别与工具调用链路",
                           "开发模拟工具接口，可调取仓库温湿度、烟雾传感器数据，结合 Prompt 工程引导模型完成风险研判",
                           "输出故障根因分析、风险评估与标准化运维处置建议，并预留对接 STM32 感知终端的数据接口",
                           "零第三方 Web 框架：标准库 HTTP 服务 + 原生 JS 前端，python app.py 即可运行，离线也能完整演示",
                           "知识库用 Markdown 维护，检索层抽象成 search(query, top_k)，可整体替换为向量库而不动上层逻辑"
                       ],
        "code":  [
                     {
                         "title":  "意图 → 工具 → 研判 → 回答（planner.py）",
                         "text":  "def run(session_id: str, message: str) -> dict:\n    trace = []\n    intent, why = classify(message)          # 1. 规则识别意图\n    device_id = tools.resolve_device(message)  # 2. 从口语里认出终端编号\n\n    sensor_res = tools.read_sensors(device_id)\n    trace.append(_step(\"调用工具 · read_sensors\", sensor_res[\"text\"]))\n    rows = sensor_res[\"data\"]\n    target = _pick_target(rows, message, device_id, session_id)\n\n    know_res = tools.retrieve_knowledge(query, 5)   # 3. 知识库检索\n    trace.append(_step(\"检索知识库\", know_res[\"text\"]))\n\n    trace.append(_step(\"风险研判\", \"%s：%s 级\" % (target[\"name\"], target[\"level\"])))\n    if llm.available():                            # 4. 有大模型就交给它组织语言\n        answer_text = llm.complete(SYSTEM_PROMPT, history + [...])"
                     },
                     {
                         "title":  "工具注册表：离线规则和大模型消费同一种结果（tools.py）",
                         "text":  "def read_sensors(device_id: str | None = None) -> dict:\n    \"\"\"每个工具都返回 {ok, text, data}，上层不需要关心是谁调的。\"\"\"\n    if device_id:\n        d = sensors.get(device_id)\n        level, reasons = sensors.level_of(d)\n        d[\"level\"], d[\"reasons\"] = level, reasons\n        return {\"ok\": True, \"text\": \"%s 读数已取回\" % d[\"name\"], \"data\": [d]}\n\nREGISTRY = {\n    \"read_sensors\":      {\"desc\": \"读取温湿度与可燃气体\", \"run\": read_sensors},\n    \"retrieve_knowledge\": {\"desc\": \"检索运维知识库\",      \"run\": retrieve_knowledge},\n    \"create_ticket\":      {\"desc\": \"生成运维工单\",        \"run\": create_ticket},\n}"
                     },
                     {
                         "title":  "STM32 数据接入：终端 POST 一次，看板立刻用真实读数（app.py）",
                         "text":  "if path == \"/api/ingest\":\n    device = sensors.ingest(payload)   # {\"device_id\":\"WH-A1\",\"temp\":25.1,\"smoke\":130}\n    if not device:\n        return self._json({\"ok\": False, \"error\": \"未知设备\"}, 404)\n    return self._json({\"ok\": True, \"device\": device})"
                     }
                 ],
        "download":  "",
        "downloadLabel":  "",
        "images":  [
                       {
                           "src":  "projects/01-工业运维智能Agent原型/01-主界面总览.png",
                           "alt":  "01-主界面总览",
                           "caption":  "01-主界面总览"
                       },
                       {
                           "src":  "projects/01-工业运维智能Agent原型/02-可燃气体报警研判.png",
                           "alt":  "02-可燃气体报警研判",
                           "caption":  "02-可燃气体报警研判"
                       }
                   ]
    },
    {
        "id":  "02-STM32监测报警系统",
        "title":  "基于 STM32 的温湿度与可燃气体监测报警系统",
        "subtitle":  "毕业设计 · 硬件 + 固件 + 文档",
        "period":  "2025.03 – 2025.06",
        "role":  "独立完成",
        "tags":  [
                     "STM32",
                     "Altium Designer",
                     "C",
                     "DS18B20",
                     "MQ-2"
                 ],
        "summary":  "一个环境监测装置。DS18B20 采集环境温度，MQ-2 采集可燃气体浓度，数据超过阈值时蜂鸣器报警，同时通过串口把实时数据送到电脑端观察。从原理图、PCB 布线、焊接调试到固件编写全部自己完成。",
        "highlights":  [
                           "独立完成原理图设计、PCB 布线、元件焊接与整机调试",
                           "固件按功能分模块编写：温度采集、气体采集、阈值判断、报警输出",
                           "串口上传实时数据，可在电脑端观察数值与报警状态变化",
                           "装置做成前后两块的实物结构，正面显示、背面走线"
                       ],
        "code":  [

                 ],
        "download":  "",
        "downloadLabel":  "",
        "images":  [
                       {
                           "src":  "projects/02-STM32监测报警系统/web/01-实物作品.jpg",
                           "alt":  "01-实物作品",
                           "caption":  "01-实物作品"
                       },
                       {
                           "src":  "projects/02-STM32监测报警系统/web/02-PCB布线.png",
                           "alt":  "02-PCB布线",
                           "caption":  "02-PCB布线"
                       },
                       {
                           "src":  "projects/02-STM32监测报警系统/web/03-系统框图.png",
                           "alt":  "03-系统框图",
                           "caption":  "03-系统框图"
                       },
                       {
                           "src":  "projects/02-STM32监测报警系统/04-主程序流程.png",
                           "alt":  "04-主程序流程",
                           "caption":  "04-主程序流程"
                       }
                   ]
    },
    {
        "id":  "03-随心记Android记事应用",
        "title":  "随心记 · Android 本地记事应用",
        "subtitle":  "Android 实战应用 · 本地化存储",
        "period":  "2024.11 – 2025.01",
        "role":  "独立开发",
        "tags":  [
                     "Android Studio",
                     "Java",
                     "SQLite",
                     "CRUD"
                 ],
        "summary":  "日常记录需求频繁，而主流笔记 App 功能冗杂、依赖网络，缺少一款轻量、完全本地化的备忘工具。于是独立开发了这款本地记事 App，实现账号管理、笔记增删改查与本地数据持久化。",
        "highlights":  [
                           "基于 Java 与系统原生 API 搭建，登录注册、笔记列表、编辑页三个界面全部自己写布局与交互",
                           "SQLite 设计用户表与笔记表，密码只存 PBKDF2 加盐摘要；笔记按账号隔离，增删改查全套 CRUD",
                           "加入全局异常捕获与操作级 try/catch，数据库出错只提示不闪退，崩溃堆栈落盘方便排查",
                           "已打出可安装的签名 APK（v1.0，minSdk 23），可直接装到 Android 手机上使用"
                       ],
        "code":  [
                     {
                         "title":  "建表：用户表 + 笔记表 + 联合索引（Db.java）",
                         "text":  "@Override\npublic void onCreate(SQLiteDatabase db) {\n    db.execSQL(\"CREATE TABLE users (\" +\n            \"id INTEGER PRIMARY KEY AUTOINCREMENT,\" +\n            \"username TEXT NOT NULL UNIQUE,\" +\n            \"salt TEXT NOT NULL,\" +\n            \"hash TEXT NOT NULL,\" +\n            \"created_at INTEGER NOT NULL)\");\n    db.execSQL(\"CREATE TABLE notes (\" +\n            \"id INTEGER PRIMARY KEY AUTOINCREMENT,\" +\n            \"user_id INTEGER NOT NULL,\" +\n            \"title TEXT NOT NULL DEFAULT '',\" +\n            \"content TEXT NOT NULL DEFAULT '',\" +\n            \"created_at INTEGER NOT NULL,\" +\n            \"updated_at INTEGER NOT NULL)\");\n    // 列表页永远是「某个人的笔记按更新时间倒序」，索引直接对着这个查询建\n    db.execSQL(\"CREATE INDEX idx_notes_user ON notes(user_id, updated_at DESC)\");\n}"
                     },
                     {
                         "title":  "密码不存明文：PBKDF2 加盐摘要（Db.java）",
                         "text":  "private static String digest(String password, byte[] salt) {\n    try {\n        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 10000, 256);\n        byte[] out = SecretKeyFactory.getInstance(\"PBKDF2WithHmacSHA256\")\n                .generateSecret(spec).getEncoded();\n        return Base64.encodeToString(out, Base64.NO_WRAP);\n    } catch (Exception e) {\n        throw new IllegalStateException(\"密码摘要计算失败\", e);\n    }\n}\n\n// 校验时用同样的 salt 再算一遍，比对摘要而不是比对密码\nString expected = c.getString(2);\nreturn expected.equals(digest(password, salt)) ? c.getLong(0) : -1;"
                     },
                     {
                         "title":  "列表查询：一个 SQL 兼顾搜索与排序（Db.java）",
                         "text":  "StringBuilder sql = new StringBuilder(\n        \"SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = ?\");\nList<String> args = new ArrayList<>();\nargs.add(String.valueOf(userId));\n\nString k = keyword == null ? \"\" : keyword.trim();\nif (!k.isEmpty()) {\n    sql.append(\" AND (title LIKE ? OR content LIKE ?)\");\n    String like = \"%\" + k + \"%\";\n    args.add(like);\n    args.add(like);\n}\nsql.append(\" ORDER BY updated_at DESC\");\n\n// 全部用 ? 占位符，拼接的只有 SQL 结构，用户输入永远走参数，不存在注入\nCursor c = getReadableDatabase().rawQuery(sql.toString(), args.toArray(new String[0]));"
                     },
                     {
                         "title":  "崩溃兜底：先落盘再交回系统（App.java）",
                         "text":  "final Thread.UncaughtExceptionHandler previous = Thread.getDefaultUncaughtExceptionHandler();\nThread.setDefaultUncaughtExceptionHandler((thread, error) -> {\n    try {\n        CrashLog.save(App.this, thread, error);   // 堆栈写进 files/crash.log\n    } catch (Throwable ignored) {\n        // 兜底本身不能再崩\n    }\n    if (previous != null) previous.uncaughtException(thread, error);\n});"
                     }
                 ],
        "download":  "projects/03-随心记Android记事应用/随心记-v1.0.apk",
        "downloadLabel":  "下载 APK（1.0 · 31 KB）",
        "images":  [
                       {
                           "src":  "projects/03-随心记Android记事应用/01-登录页面.jpg",
                           "alt":  "01-登录页面",
                           "caption":  "01-登录页面"
                       },
                       {
                           "src":  "projects/03-随心记Android记事应用/02-笔记列表.jpg",
                           "alt":  "02-笔记列表",
                           "caption":  "02-笔记列表"
                       }
                   ]
    },
    {
        "id":  "04-校园图书馆借阅预约系统",
        "title":  "校园图书馆借阅 / 自习室预约系统",
        "subtitle":  "MySQL 数据库课程项目 · 借阅与座位预约",
        "period":  "2026.10 – 2026.11",
        "role":  "独立开发（数据库设计 + 后端 + 前端）",
        "tags":  [
                     "MySQL 8.0",
                     "SQL 存储过程",
                     "事务与行锁",
                     "Python",
                     "PyMySQL"
                 ],
        "summary":  "图书馆借书排队登记、自习室座位靠群里喊——这类流程用一张 Excel 记不住谁借了什么、哪个座位几点有人。于是把业务规则整体搬进 MySQL：借书、还书、订座都走存储过程，逾期扣分由触发器自动完成，热门图书、逾期名单、座位占用率由视图直接产出，后端只是一层薄薄的 HTTP 接口。同时用事务和行锁解决了「两个人同时借最后一本」的超借问题，并写了并发脚本验证。",
        "highlights":  [
                           "8 张表 + 4 视图：读者 / 书目 / 馆藏副本 / 借阅 / 罚金 / 自习室 / 座位 / 预约，外键、CHECK、索引与 ENUM 状态全覆盖",
                           "借书、还书、订座三个存储过程承担全部业务规则，OUT 参数返回状态码，后端不做第二套判断",
                           "并发安全：SELECT … FOR UPDATE 锁住副本行，两人同时借最后一本时只有一个成功（附并发测试脚本）",
                           "触发器自动结算逾期：写罚金表 + 扣信用分，信用低于 60 自动冻结借书证",
                           "4 个视图 + 1 个定时事件（每日标记逾期），报表类查询不写进后端代码",
                           "最小权限：后端用独立账号 lib_app 只拿 SELECT/INSERT/UPDATE/EXECUTE，不接触 DDL"
                       ],
        "code":  [
                     {
                         "title":  "借书存储过程：一把锁解决超借（sql/01_schema.sql）",
                         "text":  "-- 取一本在馆副本并锁住：并发借同一本书时只会有一个成功\nSELECT copy_id INTO v_copy_id FROM book_copy\n WHERE isbn = p_isbn AND status = '在馆'\n ORDER BY copy_id LIMIT 1 FOR UPDATE;\nIF v_copy_id IS NULL THEN\n  SET p_code = 1006, p_msg = '该书已全部借出';\n  LEAVE proc;\nEND IF;\n\nUPDATE book_copy SET status = '借出' WHERE copy_id = v_copy_id;\nSET p_due_at = DATE_ADD(NOW(), INTERVAL 30 DAY);\nINSERT INTO loan (copy_id, reader_id, borrow_at, due_at)\nVALUES (v_copy_id, v_reader_id, NOW(), p_due_at);"
                     },
                     {
                         "title":  "逾期自动结算：归还触发器（sql/01_schema.sql）",
                         "text":  "CREATE TRIGGER trg_loan_return\nAFTER UPDATE ON loan FOR EACH ROW\nBEGIN\n  DECLARE v_days INT;\n  DECLARE v_credit INT;\n  IF NEW.return_at IS NOT NULL AND OLD.return_at IS NULL THEN\n    SET v_days = GREATEST(DATEDIFF(NEW.return_at, NEW.due_at), 0);\n    IF v_days > 0 THEN\n      INSERT INTO fine (loan_id, reader_id, days_overdue, amount)\n      VALUES (NEW.id, NEW.reader_id, v_days, v_days * 0.20);\n\n      -- 先把扣分后的值算出来再写：MySQL 的 SET 从左到右赋值，\n      -- 若在同一个 UPDATE 里先改 credit 再用 credit 判断，会扣两次\n      SELECT GREATEST(CAST(credit AS SIGNED) - v_days * 2, 0) INTO v_credit\n        FROM reader WHERE id = NEW.reader_id;\n      UPDATE reader\n         SET credit = v_credit,\n             status = IF(v_credit < 60, '冻结', status)\n       WHERE id = NEW.reader_id;\n    END IF;\n  END IF;\nEND"
                     },
                     {
                         "title":  "预约冲突检查：同一座位的时段不允许重叠（sql/01_schema.sql）",
                         "text":  "-- 同一座位、时间段重叠检查（加锁，避免两人抢到同一时段）\nSELECT COUNT(*) INTO v_conflict FROM reservation\n WHERE seat_id = p_seat_id\n   AND status IN ('已预约', '已签到')\n   AND start_at < p_end AND end_at > p_start\n FOR UPDATE;\nIF v_conflict > 0 THEN\n  SET p_code = 2005, p_msg = '该时段已被预约，换个时间或座位';\n  LEAVE proc;\nEND IF;"
                     }
                 ],
        "download":  "",
        "downloadLabel":  "",
        "images":  [
                       {
                           "src":  "projects/04-校园图书馆借阅预约系统/01-借阅台.png",
                           "alt":  "01-借阅台",
                           "caption":  "01-借阅台"
                       },
                       {
                           "src":  "projects/04-校园图书馆借阅预约系统/02-自习室座位预约.png",
                           "alt":  "02-自习室座位预约",
                           "caption":  "02-自习室座位预约"
                       },
                       {
                           "src":  "projects/04-校园图书馆借阅预约系统/03-数据看板.png",
                           "alt":  "03-数据看板",
                           "caption":  "03-数据看板"
                       }
                   ]
    }
];
