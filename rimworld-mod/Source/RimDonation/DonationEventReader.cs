using System;
using System.IO;
using System.Net;
using System.Text;
using Verse;

namespace RimDonation
{
    public static class DonationEventReader
    {
        private static string _serverUrl;

        // 우선순위: 환경변수 → config 파일 → 기본값
        public static string ServerUrl
        {
            get
            {
                if (_serverUrl != null) return _serverUrl;

                string envUrl = Environment.GetEnvironmentVariable("RIMDONATION_SERVER_URL");
                if (!string.IsNullOrWhiteSpace(envUrl))
                {
                    _serverUrl = envUrl.TrimEnd('/');
                    Log.Message("[RimDonation] 서버 URL (환경변수): " + _serverUrl);
                    return _serverUrl;
                }

                string configPath = Path.Combine(ConfigDir, "server.url");
                if (File.Exists(configPath))
                {
                    string url = File.ReadAllText(configPath, Encoding.UTF8).Trim();
                    if (!string.IsNullOrWhiteSpace(url))
                    {
                        _serverUrl = url.TrimEnd('/');
                        Log.Message("[RimDonation] 서버 URL (config): " + _serverUrl);
                        return _serverUrl;
                    }
                }

                _serverUrl = "http://localhost:33210";
                return _serverUrl;
            }
        }

        public static string ConfigDir =>
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "RimWorldDonation");

        // 로컬 fallback 경로 (서버와 같은 PC일 때만 유효)
        public static string EventFilePath => Path.Combine(ConfigDir, "event.json");

        public static DonationEvent TryReadAndConsume()
        {
            // 1순위: HTTP polling
            DonationEvent fromHttp = TryFetchFromServer();
            if (fromHttp != null) return fromHttp;

            // 2순위: 로컬 파일 fallback
            return TryReadFromFile();
        }

        private static DonationEvent TryFetchFromServer()
        {
            try
            {
                var request = (HttpWebRequest)WebRequest.Create(ServerUrl + "/event");
                request.Method = "GET";
                request.Timeout = 1000;
                request.Accept = "application/json";

                using (var response = (HttpWebResponse)request.GetResponse())
                {
                    if (response.StatusCode == HttpStatusCode.NoContent)
                        return null;

                    using (var reader = new StreamReader(response.GetResponseStream(), Encoding.UTF8))
                    {
                        string json = reader.ReadToEnd();
                        if (string.IsNullOrWhiteSpace(json) || json.Trim() == "null")
                            return null;

                        var result = JsonUtility.FromJson<DonationEvent>(json);
                        if (result == null || string.IsNullOrEmpty(result.eventType))
                            return null;

                        Log.Message($"[RimDonation] HTTP 수신: {result.eventType} / {result.nickname} / {result.amount}원");
                        return result;
                    }
                }
            }
            catch (WebException)
            {
                // 서버 미실행 상태 — 조용히 fallback
                return null;
            }
            catch (Exception ex)
            {
                Log.Warning("[RimDonation] HTTP 폴링 오류: " + ex.Message);
                return null;
            }
        }

        private static DonationEvent TryReadFromFile()
        {
            try
            {
                if (!File.Exists(EventFilePath)) return null;

                string json = File.ReadAllText(EventFilePath, Encoding.UTF8);

                DonationEvent result;
                try
                {
                    result = JsonUtility.FromJson<DonationEvent>(json);
                    if (result == null || string.IsNullOrEmpty(result.eventType))
                        throw new Exception("eventType 없음");
                }
                catch (Exception parseEx)
                {
                    Log.Error("[RimDonation] JSON 파싱 실패, .error로 이동: " + parseEx.Message);
                    string errorPath = EventFilePath + ".error";
                    if (File.Exists(errorPath)) File.Delete(errorPath);
                    File.Move(EventFilePath, errorPath);
                    return null;
                }

                File.Delete(EventFilePath);
                Log.Message($"[RimDonation] 파일 수신: {result.eventType} / {result.nickname} / {result.amount}원");
                return result;
            }
            catch (Exception ex)
            {
                Log.Error("[RimDonation] 파일 읽기 실패: " + ex.Message);
                return null;
            }
        }
    }
}
