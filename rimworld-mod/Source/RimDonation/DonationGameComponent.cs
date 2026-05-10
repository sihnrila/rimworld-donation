using System.Threading;
using Verse;

namespace RimDonation
{
    // 게임 메인 스레드에서 매 tick 호출됨.
    // HTTP 요청은 ThreadPool 백그라운드 스레드에서 실행해 게임 프리징 방지.
    public class DonationGameComponent : GameComponent
    {
        private int tickCounter;
        private DonationEvent pendingEvent;
        private bool isFetching;
        private readonly object syncLock = new object();

        public DonationGameComponent(Game game) : base(game) { }

        public override void GameComponentTick()
        {
            base.GameComponentTick();
            tickCounter++;

            // 약 2초(120 tick)마다 처리
            if (tickCounter < 120) return;
            tickCounter = 0;

            // 백그라운드에서 가져온 이벤트 처리 (메인 스레드에서 실행)
            DonationEvent toExecute = null;
            lock (syncLock)
            {
                if (pendingEvent != null)
                {
                    toExecute = pendingEvent;
                    pendingEvent = null;
                }
            }
            if (toExecute != null)
                DonationIncidentExecutor.Execute(toExecute);

            // 이전 fetch가 완료된 경우에만 새 fetch 시작
            bool shouldFetch;
            lock (syncLock)
            {
                shouldFetch = !isFetching;
                if (shouldFetch) isFetching = true;
            }

            if (shouldFetch)
                ThreadPool.QueueUserWorkItem(FetchBackground);
        }

        private void FetchBackground(object _)
        {
            try
            {
                DonationEvent evt = DonationEventReader.TryReadAndConsume();
                if (evt != null)
                    lock (syncLock) { pendingEvent = evt; }
            }
            finally
            {
                lock (syncLock) { isFetching = false; }
            }
        }
    }
}
