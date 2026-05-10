namespace RimDonation
{
    public class DonationEvent
    {
        public string id;
        public string platform;
        public string nickname;
        public int amount;
        public string message;
        public string eventType;
        public string receivedAt;
        // item 이벤트 전용 — 서버가 선택해서 채워줌
        public string itemDefName;
        public int itemAmount;
    }
}
