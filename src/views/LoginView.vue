<!--
SPDX-FileCopyrightText: 2026 Martin Královič
SPDX-FileCopyrightText: 2026 Samuel Juhaniak
SPDX-FileCopyrightText: 2026 Tadeáš Ditte

SPDX-License-Identifier: LicenseRef-SSPL-1.0
-->

<script setup lang="ts">
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
import { cn } from "@/lib/utils"
import { ref, type HTMLAttributes } from "vue"
import { useAuth } from "vue-auth3"

const auth = useAuth()

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const emailVal = ref("");
const passVal = ref("");
const isLoading = ref(false);

async function login() {
  isLoading.value = true;
  try {
    const authRes = await auth.login({
      data: {
        email: emailVal.value,
        password: passVal.value,
      },
      redirect: { name: "/dashboard" },
      remember: true,
      staySignedIn: true,
      fetchUser: false,
    });

    console.log('Auth response:', authRes);

    // Extract token from response - check both header and data
    let token = authRes?.headers?.authorization || authRes?.data?.token || null;

    // Remove 'Bearer ' prefix if present
    if (token && typeof token === 'string') {
      token = token.replace(/^Bearer\s?/i, '');
    }

    console.log('Extracted token:', token);

    if (token) {
      localStorage.setItem('key', token);
      console.log('Token stored in localStorage');
    } else {
      console.warn('No token found in auth response');
    }
  } catch (error) {
    console.error('Login failed:', error);
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
