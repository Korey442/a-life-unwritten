// 1ターンのオーケストレーション: L4 tick → L3 生成 → L2 検証適用 → L4 締切処理。
// aiCall を注入可能にして、AI無しでも（モックで）テストできる。
import { tick, markOffered, processDeadlines } from "./pacing.js";
import { verifyApply } from "./verify.js";

export async function runTurn(world, action, aiCall) {
  // L4: ターンを進める（クールダウン等の基準）
  let w = tick(world);

  // L3: 世界の反応を生成（構造化JSON）
  const res = await aiCall(w, action);

  // L2: 整合性ガードを通して適用
  let { world: applied, rejected, offered } = verifyApply(w, res);

  // offerが実際に成立していたら記録（次回クールダウン用）
  if (offered > 0) applied = markOffered(applied);

  // L4: 締切超過クエストを failed に。放置の帰結（好感度低下・フラグ）を残す。
  const { world: afterDeadlines, events } = processDeadlines(applied);
  let finalWorld = afterDeadlines;

  // 締切イベントをログに刻む（非可逆な帰結の可視化）
  if (events.length > 0) {
    finalWorld = {
      ...finalWorld,
      log: [...finalWorld.log, ...events.map((e) => ({ ...finalWorld.time, text: e.text, kind: "deadline" }))],
    };
  }

  return { world: finalWorld, rejected, deadlineEvents: events, res };
}
