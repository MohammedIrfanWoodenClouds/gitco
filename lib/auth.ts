import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
const secret=new TextEncoder().encode(process.env.AUTH_SECRET||'development-only-secret');
export type Role='admin'|'management';
export async function signSession(username:string,role:Role){return new SignJWT({username,role}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('8h').sign(secret)}
export async function getSession(){const c=await cookies();const token=c.get('gitco_session')?.value;if(!token)return null;try{return (await jwtVerify(token,secret)).payload as {username:string;role:Role}}catch{return null}}
export function credentials(){return [{username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD,role:'admin' as Role},{username:process.env.MANAGEMENT1_USERNAME,password:process.env.MANAGEMENT1_PASSWORD,role:'management' as Role},{username:process.env.MANAGEMENT2_USERNAME,password:process.env.MANAGEMENT2_PASSWORD,role:'management' as Role}]}
