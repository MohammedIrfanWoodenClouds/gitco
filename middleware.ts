import {NextRequest,NextResponse} from 'next/server';
export function middleware(req:NextRequest){
 const protectedPath=req.nextUrl.pathname.startsWith('/reports')||req.nextUrl.pathname.startsWith('/admin');
 if(!protectedPath)return NextResponse.next();
 if(!req.cookies.get('gitco_session'))return NextResponse.redirect(new URL('/login',req.url));
 return NextResponse.next();
}
export const config={matcher:['/reports/:path*','/admin/:path*']};
