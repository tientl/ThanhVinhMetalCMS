import config from '@payload-config'
import { getPayload } from 'payload'

/** Payload Local API client, dùng trong server component và route handler. */
export const getPayloadClient = () => getPayload({ config })
