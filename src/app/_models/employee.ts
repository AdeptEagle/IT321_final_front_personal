import { Account, Department } from '@app/_models'

export class Employee {
  id: string
  employeeId: string
  position: string
  userId: string        // one to one relationship between this id and id sa account table
  departmentId: string    // one to many relationship sa department id adtu sa department table
  hireDate: string
  isActive: boolean
  account?: any
  department?: any
} 