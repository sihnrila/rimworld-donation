using System;
using RimWorld;
using Verse;

namespace RimDonation
{
    public static class DonationIncidentExecutor
    {
        public static void Execute(DonationEvent donationEvent)
        {
            Map map = Find.CurrentMap;
            if (map == null)
            {
                Log.Warning("[RimDonation] 현재 맵 없음. 이벤트 스킵: " + donationEvent.eventType);
                return;
            }

            Messages.Message(
                $"[후원] {donationEvent.nickname} / {donationEvent.amount:N0}원 → {donationEvent.eventType}",
                MessageTypeDefOf.PositiveEvent
            );

            Log.Message($"[RimDonation] 이벤트 실행: {donationEvent.eventType} | {donationEvent.nickname} | {donationEvent.amount}원");

            switch (donationEvent.eventType)
            {
                case "raid":
                    ExecuteRaid(map, 500f);
                    break;
                case "mech_raid":
                    ExecuteMechRaid(map, 1200f);
                    break;
                case "animal":
                    ExecuteAnimal(map, 300f);
                    break;
                case "fire":
                    ExecuteFire(map);
                    break;
                case "item":
                default:
                    ExecuteItemDrop(map, donationEvent.itemDefName, donationEvent.itemAmount);
                    break;
            }
        }

        private static void ExecuteRaid(Map map, float points)
        {
            IncidentDef def = IncidentDefOf.RaidEnemy;
            IncidentParms parms = StorytellerUtility.DefaultParmsNow(def.category, map);
            parms.points = points;
            bool ok = def.Worker.TryExecute(parms);
            if (ok) Log.Message("[RimDonation] 레이드 발생 성공");
            else    Log.Warning("[RimDonation] 레이드 발생 실패 (TryExecute=false)");
        }

        private static void ExecuteMechRaid(Map map, float points)
        {
            IncidentDef mechDef = DefDatabase<IncidentDef>.GetNamedSilentFail("MechCluster");
            if (mechDef != null)
            {
                IncidentParms parms = StorytellerUtility.DefaultParmsNow(mechDef.category, map);
                parms.points = points;
                if (mechDef.Worker.TryExecute(parms))
                {
                    Log.Message("[RimDonation] 메카노이드 클러스터 발생 성공");
                    return;
                }
            }
            Log.Warning("[RimDonation] MechCluster 실패, 강화 레이드로 대체");
            ExecuteRaid(map, points);
        }

        private static void ExecuteAnimal(Map map, float points)
        {
            IncidentDef def = IncidentDefOf.ManhunterPack;
            IncidentParms parms = StorytellerUtility.DefaultParmsNow(def.category, map);
            parms.points = points;
            bool ok = def.Worker.TryExecute(parms);
            if (ok) Log.Message("[RimDonation] 동물 폭주 발생 성공");
            else    Log.Warning("[RimDonation] 동물 폭주 발생 실패");
        }

        private static void ExecuteFire(Map map)
        {
            int started = 0;
            int tries = 0;
            while (started < 3 && tries < 30)
            {
                tries++;
                IntVec3 cell = CellFinderLoose.RandomCellWith(
                    c => c.Standable(map) && !c.Fogged(map), map);
                if (!cell.IsValid) continue;
                if (FireUtility.TryStartFireIn(cell, map, Rand.Range(0.4f, 1.0f), null))
                    started++;
            }
            Log.Message($"[RimDonation] 화재 {started}곳 발생");
        }

        private static void ExecuteItemDrop(Map map, string itemDefName, int itemAmount)
        {
            // defName 유효성 확인
            ThingDef thingDef = null;
            if (!string.IsNullOrEmpty(itemDefName))
            {
                thingDef = DefDatabase<ThingDef>.GetNamedSilentFail(itemDefName);
                if (thingDef == null)
                    Log.Warning($"[RimDonation] 알 수 없는 itemDefName: {itemDefName}, Silver로 대체");
            }
            if (thingDef == null)
                thingDef = ThingDefOf.Silver;

            // 수량 결정 (0이면 fallback)
            int amount = itemAmount > 0 ? itemAmount : Rand.RangeInclusive(1, 50);
            // 스택 한도 초과 방지
            if (thingDef.stackLimit > 0)
                amount = Math.Min(amount, thingDef.stackLimit);

            IntVec3 cell = DropCellFinder.TradeDropSpot(map);
            Thing thing = ThingMaker.MakeThing(thingDef);
            thing.stackCount = amount;
            GenPlace.TryPlaceThing(thing, cell, map, ThingPlaceMode.Near);

            Log.Message($"[RimDonation] 아이템 드랍: {thingDef.defName} × {amount}");
        }
    }
}
