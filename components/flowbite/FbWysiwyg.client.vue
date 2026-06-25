<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor, } from "@tiptap/vue-3";
import { onBeforeUnmount, watch, } from "vue";

import {
    fbWysiwygEditor,
    fbWysiwygToolbar,
    fbWysiwygToolbarButton,
    fbWysiwygToolbarButtonActive,
    fbWysiwygWrap,
} from "@/lib/flowbite-classes";
import { cn, } from "@/lib/utils";

const props = withDefaults(
    defineProps<{
        modelValue?: string;
        editable?: boolean;
        wrapperClass?: string;
    }>(),
    {
        modelValue: "",
        editable: true,
    }
);

const emit = defineEmits<{
    "update:modelValue": [value: string];
}>();

const editor = useEditor ({
    content: props.modelValue,
    extensions: [StarterKit],
    editable: props.editable,
    editorProps: {
        attributes: {
            class: fbWysiwygEditor,
        },
    },
    onUpdate: ({ editor: activeEditor, }) => {
        emit ("update:modelValue", activeEditor.getHTML ());
    },
});

watch(() => props.modelValue, (value) => {
    if (! editor.value) {
        return;
    }

    if (value !== editor.value.getHTML ()) {
        editor.value.commands.setContent (value ?? "", false);
    }
});

watch(() => props.editable, (value) => {
    editor.value?.setEditable (value);
});

onBeforeUnmount(() => {
    editor.value?.destroy ();
});

function toolbarClass (isActive: boolean): string {
    return cn (
        fbWysiwygToolbarButton,
        isActive && fbWysiwygToolbarButtonActive
    );
}
</script>

<template>
    <div :class="cn(fbWysiwygWrap, wrapperClass)">
        <div
            v-if="editor"
            :class="fbWysiwygToolbar">
            <button
                type="button"
                :class="toolbarClass(editor.isActive('bold'))"
                :disabled="!editable"
                @click="editor.chain().focus().toggleBold().run()">
                <span class="sr-only">Bold</span>
                <span class="text-sm font-bold">B</span>
            </button>
            <button
                type="button"
                :class="toolbarClass(editor.isActive('italic'))"
                :disabled="!editable"
                @click="editor.chain().focus().toggleItalic().run()">
                <span class="sr-only">Italic</span>
                <span class="text-sm italic">I</span>
            </button>
            <button
                type="button"
                :class="toolbarClass(editor.isActive('heading', { level: 2 }))"
                :disabled="!editable"
                @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
                <span class="sr-only">Heading</span>
                <span class="text-sm font-semibold">H2</span>
            </button>
            <button
                type="button"
                :class="toolbarClass(editor.isActive('bulletList'))"
                :disabled="!editable"
                @click="editor.chain().focus().toggleBulletList().run()">
                <span class="sr-only">Bullet list</span>
                <span class="text-sm">• List</span>
            </button>
            <button
                type="button"
                :class="toolbarClass(editor.isActive('orderedList'))"
                :disabled="!editable"
                @click="editor.chain().focus().toggleOrderedList().run()">
                <span class="sr-only">Ordered list</span>
                <span class="text-sm">1. List</span>
            </button>
            <button
                type="button"
                :class="toolbarClass(editor.isActive('blockquote'))"
                :disabled="!editable"
                @click="editor.chain().focus().toggleBlockquote().run()">
                <span class="sr-only">Blockquote</span>
                <span class="text-sm">“”</span>
            </button>
            <button
                type="button"
                :class="fbWysiwygToolbarButton"
                :disabled="!editable || !editor.can().chain().focus().undo().run()"
                @click="editor.chain().focus().undo().run()">
                <span class="sr-only">Undo</span>
                <span class="text-sm">Undo</span>
            </button>
            <button
                type="button"
                :class="fbWysiwygToolbarButton"
                :disabled="!editable || !editor.can().chain().focus().redo().run()"
                @click="editor.chain().focus().redo().run()">
                <span class="sr-only">Redo</span>
                <span class="text-sm">Redo</span>
            </button>
        </div>
        <EditorContent :editor="editor" />
    </div>
</template>
