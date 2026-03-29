<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
import axios from "axios"
import { ref } from "vue"
import { useRouter } from "vue-router"
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { setAuthSession } from "@/lib/authSession"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const router = useRouter()
const fullName = ref("")
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const isLoading = ref(false)
const errorMessage = ref("")

async function signup() {
  errorMessage.value = ""

  if (password.value.length < 8) {
    errorMessage.value = "Password must be at least 8 characters."
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match."
    return
  }

  isLoading.value = true

  try {
    await axios.post('/api/auth/register', {
      fullName: fullName.value,
      email: email.value,
      password: password.value,
      passwordAgain: confirmPassword.value,
    })

    const loginResponse = await axios.post('/api/auth/login', {
      email: email.value,
      password: password.value,
    })

    const tokenFromHeader = loginResponse.headers?.authorization as string | undefined
    const tokenFromBody = (loginResponse.data as { token?: string })?.token
    const token = (tokenFromHeader ?? tokenFromBody ?? '').replace(/^Bearer\s?/i, '')

    if (!token)
      throw new Error('Missing auth token after sign up.')
    const userFromBody = (loginResponse.data as { user?: { id?: string, email?: string, fullName?: string, role?: string, roles?: string[] } }).user
    if (!userFromBody?.email)
      throw new Error('Could not resolve signed up user profile.')

    const effectiveRole = userFromBody.role ?? (Array.isArray(userFromBody.roles) ? userFromBody.roles[0] : undefined)

    setAuthSession(token, {
      id: userFromBody.id,
      email: userFromBody.email,
      fullName: userFromBody.fullName || fullName.value,
      role: effectiveRole,
      roles: Array.isArray(userFromBody.roles) ? userFromBody.roles : (effectiveRole ? [effectiveRole] : []),
    })
    axios.defaults.headers.common.Authorization = `Bearer ${token}`

    await router.push('/dashboard')
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Sign up failed."
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-xl">
          Create your account
        </CardTitle>
        <CardDescription>
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="signup">
          <FieldGroup>
            <Field>
              <FieldLabel for="name">
                Full Name
              </FieldLabel>
              <Input id="name" v-model="fullName" type="text" placeholder="John Pork" :disabled="isLoading" required />
            </Field>
            <Field>
              <FieldLabel for="email">
                Email
              </FieldLabel>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="s0cM4js3r@nncyb.com"
                :disabled="isLoading"
                required
              />
            </Field>
            <Field>
              <Field class="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel for="password">
                    Password
                  </FieldLabel>
                  <Input id="password" v-model="password" type="password" :disabled="isLoading" required />
                </Field>
                <Field>
                  <FieldLabel for="confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <Input id="confirm-password" v-model="confirmPassword" type="password" :disabled="isLoading" required />
                </Field>
              </Field>
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <Button type="submit" :disabled="isLoading">
                Create Account
              </Button>
              <p v-if="errorMessage" class="text-destructive text-center mt-2 text-sm">
                {{ errorMessage }}
              </p>
              <FieldDescription class="text-center">
                Already have an account?
                <RouterLink to="/login" class="auth-link ml-1">
                  Sign in
                </RouterLink>
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
