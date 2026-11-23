import React, {useState} from "react";
import {useClient} from "sanity";
import initialContent from "./portfolio.ndjson?raw";

export function InitialContent() {
  const client = useClient({apiVersion: "2025-02-19"});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function importContent() {
    setBusy(true);
    try {
      const docs = initialContent.trim().split("\n").map(line => JSON.parse(line));
      const tx = client.transaction();
      for (const doc of docs) tx.createIfNotExists(doc);
      await tx.commit();
      setMessage("المحتوى جاهز. اختر المشاريع أو المسيرة من قائمة إدارة المحتوى.");
    } catch (error) {
      setMessage("تعذّر الاستيراد. " + error.message);
    } finally {
      setBusy(false);
    }
  }
  return <section dir="rtl" style={{padding: 24, maxWidth: 650}}>
    <h2>إضافة محتوى الموقع الحالي</h2>
    <p>أضف نصوص الموقع ومشاريعه باللغتين إلى هذه اللوحة. تُنشأ السجلات الناقصة فقط، ويمكنك رفع الصور من كل مشروع بعد الاستيراد.</p>
    <button type="button" disabled={busy} onClick={importContent}>{busy ? "جارٍ الاستيراد…" : "استيراد المحتوى الحالي"}</button>
    <p role="status">{message}</p>
  </section>;
}
