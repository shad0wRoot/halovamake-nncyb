<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import axios from 'axios'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { setAuthSession } from '@/lib/authSession'
import { cn } from "@/lib/utils"
import { ref, type HTMLAttributes } from "vue"
import { useRouter } from 'vue-router'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const router = useRouter()
const emailVal = ref("");
const passVal = ref("");
const isLoading = ref(false);
const errorMessage = ref("")

async function login() {
  isLoading.value = true;
  errorMessage.value = ""
  try {
    const response = await axios.post('/api/auth/login', {
      email: emailVal.value,
      password: passVal.value,
    })

    const tokenFromHeader = response.headers?.authorization as string | undefined
    const tokenFromBody = (response.data as { token?: string })?.token
    const rawToken = tokenFromHeader ?? tokenFromBody ?? ""
    const token = rawToken.replace(/^Bearer\s?/i, '')

    if (!token)
      throw new Error('Missing auth token in login response.')

    const userFromBody = (response.data as { user?: { id?: string, email?: string, fullName?: string, role?: string, roles?: string[] } }).user
    let user = userFromBody ?? null
    if (!user?.email) {
      const meResponse = await axios.get('/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
      user = (meResponse.data as { user?: { email?: string, fullName?: string, name?: string, role?: string, roles?: string[] } }).user
        ?? (meResponse.data as { email?: string, fullName?: string, name?: string, role?: string, roles?: string[] })
    }

    if (!user?.email)
      throw new Error('Could not resolve authenticated user profile.')

    const effectiveRole = user.role ?? (Array.isArray(user.roles) ? user.roles[0] : undefined)

    setAuthSession(token, {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: effectiveRole,
      roles: Array.isArray(user.roles) ? user.roles : (effectiveRole ? [effectiveRole] : []),
    })
    axios.defaults.headers.common.Authorization = `Bearer ${token}`

    const normalizedRoles = new Set(
      [
        ...(Array.isArray(user.roles) ? user.roles : []),
        ...(effectiveRole ? [effectiveRole] : []),
      ].map(role => role.toUpperCase()),
    )

    if (normalizedRoles.has('ADMIN') || normalizedRoles.has('REVIEWER'))
      await router.push('/admin')
    else
      await router.push('/dashboard')
  } catch (error) {
    errorMessage.value = 'Login failed.'
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-xl">
          Welcome back
        </CardTitle>
        <CardDescription>
          Login to your NNCYB account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="login">
          <FieldGroup>
            <Field>
              <FieldLabel for="email">
                Email
              </FieldLabel>
              <Input id="email" type="email" placeholder="s0cM4js3r@nncyb.com" :disabled="isLoading" v-model="emailVal"
                required />
            </Field>
            <Field>
              <div class="flex items-center justify-between">
                <FieldLabel for="password">
                  Password
                </FieldLabel>
                <a href="#" class="ml-auto text-sm underline-offset-4 hover:underline">
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" :disabled="isLoading" v-model="passVal" required />
            </Field>
            <Field>
              <Button type="submit" v-if="!isLoading">
                Login
              </Button>
              <Button disabled v-else>
                <Spinner></Spinner>
              </Button>
              <p v-if="errorMessage" class="text-destructive text-center mt-2 text-sm">
                {{ errorMessage }}
              </p>
              <FieldDescription class="text-center">
                Don't have an account?
                <router-link to="/signup" class="auth-link ml-1">
                  Sign up
                </router-link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
    <FieldDescription class="px-6 text-center">
      By clicking continue, you agree to our <a href="#" class="auth-link">Terms of Service</a>
      and <a href="#" class="auth-link">Privacy Policy</a>.
    </FieldDescription>
  </div>
</template>
