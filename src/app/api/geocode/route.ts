import { NextRequest, NextResponse } from "next/server";

const NAVER_GEOCODE_URL = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "query 파라미터가 필요합니다." },
      { status: 400 },
    );
  }

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "네이버 API 인증 정보가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const url = `${NAVER_GEOCODE_URL}?query=${encodeURIComponent(query)}`;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const response = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": clientId,
      "X-NCP-APIGW-API-KEY": clientSecret,
      Referer: appUrl,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[geocode] Naver API error", response.status, errorBody);
    return NextResponse.json(
      { error: "주소 좌표 변환에 실패했습니다.", detail: errorBody },
      { status: response.status },
    );
  }

  const data = await response.json();
  const addresses = data.addresses as
    | Array<{ x: string; y: string }>
    | undefined;

  if (!addresses || addresses.length === 0) {
    return NextResponse.json(
      { error: "해당 주소의 좌표를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const { x, y } = addresses[0];

  return NextResponse.json({
    longitude: parseFloat(x),
    latitude: parseFloat(y),
  });
}
