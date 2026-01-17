import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import db from '../db/index.js'

const AttendanceRoutes = new Hono()

type Attendance = {
  id: number
  AttendanceID: number
  Date: string
  status: string
  CheckInTime: string
  CheckOutTime: string
}

const createAttendanceSchema = z.object({
  AttendanceID: z.number( "ID ต้องเป็นตัวเลข")
       .int("ID ต้องเป็นจำนวนเต็มเท่านั้น (ห้ามมีจุดทศนิยม)") 
       .refine((num) => num.toString().length >= 8, "ID ต้องยาว 8 หลัก"),
  
  Date: z.string()
    .refine((date) => {
      const dateRegex = /^\d{2}-\d{2}-\d{4}$/
      if (!dateRegex.test(date)) return false
      
      const [day, month, year] = date.split('-').map(Number)
      const parsedDate = new Date(year, month - 1, day)
      return day > 0 && day <= 31 && month > 0 && month <= 12 && 
             parsedDate.getDate() === day && parsedDate.getMonth() === month - 1
    }, "วันที่ต้องเป็นรูป DD-MM-YYYY เท่านั้น"),
  
  status: z.string().refine((val) => ["Online", "Offline"].includes(val), "status ต้องเป็น Online หรือ Offline เท่านั้น"),

  CheckInTime: z.string()
    .refine((time) => /^\d{2}:\d{2}$/.test(time), "CheckInTime ต้องเป็นรูป HH:MM เท่านั้น")
    .refine((time) => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
    }, "เวลา CheckIn ไม่ถูกต้อง"),

  CheckOutTime: z.string()
    .refine((time) => /^\d{2}:\d{2}$/.test(time), "CheckOutTime ต้องเป็นรูป HH:MM เท่านั้น")
    .refine((time) => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
    }, "เวลา CheckOut ไม่ถูกต้อง")
})
AttendanceRoutes.post('/',    
    zValidator('json',createAttendanceSchema)
    , async (c) => {
    const body = await c.req.json()
    return c.json({ message: 'Attendance created', data: body })
})
AttendanceRoutes.get('/', (c) => {
  return c.json({ message: 'Get list of Attendance' })
})
AttendanceRoutes.put('/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ message: `Update Attendance with ID ${id}` })
})
AttendanceRoutes.delete('/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ message: `Delete Attendance with ID ${id}` })
})
export default AttendanceRoutes ;

