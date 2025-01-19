var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* webserver/websites/KoesterVentures/src/components/Nav.svelte generated by Svelte v3.59.2 */

    const file$6 = "webserver/websites/KoesterVentures/src/components/Nav.svelte";

    function create_fragment$6(ctx) {
    	let nav;
    	let div1;
    	let a0;
    	let t1;
    	let button;
    	let span;
    	let t3;
    	let div0;
    	let t4;
    	let ul;
    	let li0;
    	let a1;
    	let t6;
    	let li1;
    	let a2;
    	let t8;
    	let li2;
    	let a3;
    	let t10;
    	let li3;
    	let a4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			a0 = element("a");
    			a0.textContent = "Koester Ventures";
    			t1 = space();
    			button = element("button");
    			span = element("span");
    			span.textContent = "Menu";
    			t3 = space();
    			div0 = element("div");
    			t4 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Portfolio";
    			t6 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Services";
    			t8 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "About";
    			t10 = space();
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Get in Touch";
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "logo svelte-z3luqj");
    			add_location(a0, file$6, 10, 4, 171);
    			attr_dev(span, "class", "sr-only");
    			add_location(span, file$6, 13, 6, 283);
    			attr_dev(div0, "class", "hamburger svelte-z3luqj");
    			toggle_class(div0, "open", /*isMenuOpen*/ ctx[0]);
    			add_location(div0, file$6, 14, 6, 323);
    			attr_dev(button, "class", "menu-toggle svelte-z3luqj");
    			add_location(button, file$6, 12, 4, 226);
    			attr_dev(a1, "href", "#portfolio");
    			attr_dev(a1, "class", "svelte-z3luqj");
    			add_location(a1, file$6, 18, 10, 457);
    			add_location(li0, file$6, 18, 6, 453);
    			attr_dev(a2, "href", "#services");
    			attr_dev(a2, "class", "svelte-z3luqj");
    			add_location(a2, file$6, 19, 10, 507);
    			add_location(li1, file$6, 19, 6, 503);
    			attr_dev(a3, "href", "#about");
    			attr_dev(a3, "class", "svelte-z3luqj");
    			add_location(a3, file$6, 20, 10, 555);
    			add_location(li2, file$6, 20, 6, 551);
    			attr_dev(a4, "href", "#contact");
    			attr_dev(a4, "class", "cta-button svelte-z3luqj");
    			add_location(a4, file$6, 21, 10, 597);
    			add_location(li3, file$6, 21, 6, 593);
    			attr_dev(ul, "class", "nav-links svelte-z3luqj");
    			toggle_class(ul, "open", /*isMenuOpen*/ ctx[0]);
    			add_location(ul, file$6, 17, 4, 400);
    			attr_dev(div1, "class", "container nav-container svelte-z3luqj");
    			add_location(div1, file$6, 9, 2, 129);
    			attr_dev(nav, "class", "nav svelte-z3luqj");
    			add_location(nav, file$6, 8, 0, 109);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, a0);
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			append_dev(button, span);
    			append_dev(button, t3);
    			append_dev(button, div0);
    			append_dev(div1, t4);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(ul, t6);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(ul, t8);
    			append_dev(ul, li2);
    			append_dev(li2, a3);
    			append_dev(ul, t10);
    			append_dev(ul, li3);
    			append_dev(li3, a4);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleMenu*/ ctx[1], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isMenuOpen*/ 1) {
    				toggle_class(div0, "open", /*isMenuOpen*/ ctx[0]);
    			}

    			if (dirty & /*isMenuOpen*/ 1) {
    				toggle_class(ul, "open", /*isMenuOpen*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);
    	let isMenuOpen = false;

    	function toggleMenu() {
    		$$invalidate(0, isMenuOpen = !isMenuOpen);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ isMenuOpen, toggleMenu });

    	$$self.$inject_state = $$props => {
    		if ('isMenuOpen' in $$props) $$invalidate(0, isMenuOpen = $$props.isMenuOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isMenuOpen, toggleMenu];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* webserver/websites/KoesterVentures/src/components/Hero.svelte generated by Svelte v3.59.2 */
    const file$5 = "webserver/websites/KoesterVentures/src/components/Hero.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let div2;
    	let div1;
    	let h1;
    	let t0;
    	let br;
    	let span;
    	let t1;
    	let t2;
    	let p;
    	let t4;
    	let div0;
    	let a0;
    	let t6;
    	let a1;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text("Transforming Ideas into ");
    			br = element("br");
    			span = element("span");
    			t1 = text(/*typed*/ ctx[0]);
    			t2 = space();
    			p = element("p");
    			p.textContent = "We build innovative software solutions that drive business growth\n        and user engagement.";
    			t4 = space();
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "View Our Work";
    			t6 = space();
    			a1 = element("a");
    			a1.textContent = "Get in Touch";
    			add_location(br, file$5, 41, 34, 1084);
    			attr_dev(span, "class", "typing svelte-1f4l3ob");
    			add_location(span, file$5, 41, 39, 1089);
    			attr_dev(h1, "class", "svelte-1f4l3ob");
    			add_location(h1, file$5, 41, 6, 1056);
    			attr_dev(p, "class", "subtitle svelte-1f4l3ob");
    			add_location(p, file$5, 42, 6, 1136);
    			attr_dev(a0, "href", "#portfolio");
    			attr_dev(a0, "class", "btn primary svelte-1f4l3ob");
    			add_location(a0, file$5, 47, 8, 1311);
    			attr_dev(a1, "href", "#contact");
    			attr_dev(a1, "class", "btn secondary svelte-1f4l3ob");
    			add_location(a1, file$5, 48, 8, 1378);
    			attr_dev(div0, "class", "cta-buttons svelte-1f4l3ob");
    			add_location(div0, file$5, 46, 6, 1277);
    			attr_dev(div1, "class", "hero-content svelte-1f4l3ob");
    			add_location(div1, file$5, 40, 4, 1023);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$5, 39, 2, 995);
    			attr_dev(section, "class", "hero section svelte-1f4l3ob");
    			add_location(section, file$5, 38, 0, 962);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t0);
    			append_dev(h1, br);
    			append_dev(h1, span);
    			append_dev(span, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t6);
    			append_dev(div0, a1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*typed*/ 1) set_data_dev(t1, /*typed*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hero', slots, []);
    	let typed = '';
    	let phrases = ['Software Development', 'Web Design', 'Mobile Apps', 'Cloud Solutions'];
    	let currentPhraseIndex = 0;
    	let isDeleting = false;
    	let typingSpeed = 100;
    	let deletingSpeed = 50;
    	let pauseEnd = 2000;

    	onMount(() => {
    		typeWriter();
    	});

    	function typeWriter() {
    		const currentPhrase = phrases[currentPhraseIndex];

    		if (isDeleting) {
    			$$invalidate(0, typed = currentPhrase.substring(0, typed.length - 1));
    		} else {
    			$$invalidate(0, typed = currentPhrase.substring(0, typed.length + 1));
    		}

    		let typeSpeed = isDeleting ? deletingSpeed : typingSpeed;

    		if (!isDeleting && typed === currentPhrase) {
    			typeSpeed = pauseEnd;
    			isDeleting = true;
    		} else if (isDeleting && typed === '') {
    			isDeleting = false;
    			currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
    		}

    		setTimeout(typeWriter, typeSpeed);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		typed,
    		phrases,
    		currentPhraseIndex,
    		isDeleting,
    		typingSpeed,
    		deletingSpeed,
    		pauseEnd,
    		typeWriter
    	});

    	$$self.$inject_state = $$props => {
    		if ('typed' in $$props) $$invalidate(0, typed = $$props.typed);
    		if ('phrases' in $$props) phrases = $$props.phrases;
    		if ('currentPhraseIndex' in $$props) currentPhraseIndex = $$props.currentPhraseIndex;
    		if ('isDeleting' in $$props) isDeleting = $$props.isDeleting;
    		if ('typingSpeed' in $$props) typingSpeed = $$props.typingSpeed;
    		if ('deletingSpeed' in $$props) deletingSpeed = $$props.deletingSpeed;
    		if ('pauseEnd' in $$props) pauseEnd = $$props.pauseEnd;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [typed];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* webserver/websites/KoesterVentures/src/components/Portfolio.svelte generated by Svelte v3.59.2 */

    const file$4 = "webserver/websites/KoesterVentures/src/components/Portfolio.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (41:14) {#each project.tags as tag}
    function create_each_block_1$2(ctx) {
    	let span;
    	let t_value = /*tag*/ ctx[4] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "tag svelte-3e8e33");
    			add_location(span, file$4, 41, 16, 1428);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(41:14) {#each project.tags as tag}",
    		ctx
    	});

    	return block;
    }

    // (32:6) {#each projects as project}
    function create_each_block$2(ctx) {
    	let div3;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let h3;
    	let t1_value = /*project*/ ctx[1].title + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*project*/ ctx[1].description + "";
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let each_value_1 = /*project*/ ctx[1].tags;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			if (!src_url_equal(img.src, img_src_value = /*project*/ ctx[1].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*project*/ ctx[1].title);
    			attr_dev(img, "class", "svelte-3e8e33");
    			add_location(img, file$4, 34, 12, 1156);
    			attr_dev(div0, "class", "project-image svelte-3e8e33");
    			add_location(div0, file$4, 33, 10, 1116);
    			attr_dev(h3, "class", "svelte-3e8e33");
    			add_location(h3, file$4, 37, 12, 1273);
    			attr_dev(p, "class", "svelte-3e8e33");
    			add_location(p, file$4, 38, 12, 1310);
    			attr_dev(div1, "class", "tags svelte-3e8e33");
    			add_location(div1, file$4, 39, 12, 1351);
    			attr_dev(div2, "class", "project-content svelte-3e8e33");
    			add_location(div2, file$4, 36, 10, 1231);
    			attr_dev(div3, "class", "project-card svelte-3e8e33");
    			add_location(div3, file$4, 32, 8, 1079);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, img);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, h3);
    			append_dev(h3, t1);
    			append_dev(div2, t2);
    			append_dev(div2, p);
    			append_dev(p, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			append_dev(div3, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*projects*/ 1) {
    				each_value_1 = /*project*/ ctx[1].tags;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(32:6) {#each projects as project}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let div1;
    	let h2;
    	let t1;
    	let p;
    	let t3;
    	let div0;
    	let each_value = /*projects*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Our Work";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Check out some of our recent projects that showcase our expertise in building modern, scalable solutions.";
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-3e8e33");
    			add_location(h2, file$4, 25, 4, 825);
    			attr_dev(p, "class", "section-description svelte-3e8e33");
    			add_location(p, file$4, 26, 4, 847);
    			attr_dev(div0, "class", "projects-grid svelte-3e8e33");
    			add_location(div0, file$4, 30, 4, 1009);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$4, 24, 2, 797);
    			attr_dev(section, "id", "portfolio");
    			attr_dev(section, "class", "section portfolio svelte-3e8e33");
    			add_location(section, file$4, 23, 0, 744);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*projects*/ 1) {
    				each_value = /*projects*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Portfolio', slots, []);

    	const projects = [
    		{
    			title: "Cabl3D",
    			description: "A mobile app for cable wakeboard parks to manage their operations and engage with riders.",
    			tags: ["Mobile App", "React Native", "Python", "FastAPI"],
    			image: "/assets/cabl3d.jpg"
    		},
    		{
    			title: "CableCoin",
    			description: "A cryptocurrency platform for the cable wakeboarding industry.",
    			tags: ["Web3", "Blockchain", "Svelte", "Smart Contracts"],
    			image: "/assets/cablecoin.jpg"
    		},
    		{
    			title: "CabledWakeparks",
    			description: "An informational platform for cable wakeboard parks worldwide.",
    			tags: ["Web Development", "Svelte", "Python"],
    			image: "/assets/cabledwakeparks.jpg"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Portfolio> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ projects });
    	return [projects];
    }

    class Portfolio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Portfolio",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* webserver/websites/KoesterVentures/src/components/Services.svelte generated by Svelte v3.59.2 */

    const file$3 = "webserver/websites/KoesterVentures/src/components/Services.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (64:12) {#each service.features as feature}
    function create_each_block_1$1(ctx) {
    	let li;
    	let t_value = /*feature*/ ctx[4] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-6z2qtm");
    			add_location(li, file$3, 64, 14, 1848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(64:12) {#each service.features as feature}",
    		ctx
    	});

    	return block;
    }

    // (58:6) {#each services as service}
    function create_each_block$1(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*service*/ ctx[1].icon + "";
    	let t0;
    	let t1;
    	let h3;
    	let t2_value = /*service*/ ctx[1].title + "";
    	let t2;
    	let t3;
    	let p;
    	let t4_value = /*service*/ ctx[1].description + "";
    	let t4;
    	let t5;
    	let ul;
    	let t6;
    	let each_value_1 = /*service*/ ctx[1].features;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			h3 = element("h3");
    			t2 = text(t2_value);
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			attr_dev(div0, "class", "service-icon svelte-6z2qtm");
    			add_location(div0, file$3, 59, 10, 1628);
    			attr_dev(h3, "class", "svelte-6z2qtm");
    			add_location(h3, file$3, 60, 10, 1685);
    			attr_dev(p, "class", "svelte-6z2qtm");
    			add_location(p, file$3, 61, 10, 1720);
    			attr_dev(ul, "class", "features-list svelte-6z2qtm");
    			add_location(ul, file$3, 62, 10, 1759);
    			attr_dev(div1, "class", "service-card svelte-6z2qtm");
    			add_location(div1, file$3, 58, 8, 1591);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, h3);
    			append_dev(h3, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(p, t4);
    			append_dev(div1, t5);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append_dev(div1, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*services*/ 1) {
    				each_value_1 = /*service*/ ctx[1].features;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(58:6) {#each services as service}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let div1;
    	let h2;
    	let t1;
    	let p;
    	let t3;
    	let div0;
    	let each_value = /*services*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Our Services";
    			t1 = space();
    			p = element("p");
    			p.textContent = "We offer comprehensive software development services to help businesses thrive in the digital age.";
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-6z2qtm");
    			add_location(h2, file$3, 51, 4, 1344);
    			attr_dev(p, "class", "section-description svelte-6z2qtm");
    			add_location(p, file$3, 52, 4, 1370);
    			attr_dev(div0, "class", "services-grid svelte-6z2qtm");
    			add_location(div0, file$3, 56, 4, 1521);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$3, 50, 2, 1316);
    			attr_dev(section, "id", "services");
    			attr_dev(section, "class", "section services svelte-6z2qtm");
    			add_location(section, file$3, 49, 0, 1265);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*services*/ 1) {
    				each_value = /*services*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Services', slots, []);

    	const services = [
    		{
    			title: "Web Development",
    			description: "Custom websites and web applications built with modern technologies and best practices.",
    			icon: "🌐",
    			features: [
    				"Responsive Design",
    				"Progressive Web Apps",
    				"E-commerce Solutions",
    				"Content Management Systems"
    			]
    		},
    		{
    			title: "Mobile Development",
    			description: "Native and cross-platform mobile applications for iOS and Android.",
    			icon: "📱",
    			features: [
    				"React Native Apps",
    				"Native iOS/Android",
    				"App Store Deployment",
    				"Mobile UI/UX Design"
    			]
    		},
    		{
    			title: "Backend Development",
    			description: "Scalable and secure server-side solutions for your applications.",
    			icon: "⚙️",
    			features: [
    				"API Development",
    				"Database Design",
    				"Cloud Infrastructure",
    				"System Architecture"
    			]
    		},
    		{
    			title: "Web3 Solutions",
    			description: "Blockchain and cryptocurrency integration for modern applications.",
    			icon: "🔗",
    			features: [
    				"Smart Contracts",
    				"DApp Development",
    				"Token Integration",
    				"Blockchain Consulting"
    			]
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Services> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ services });
    	return [services];
    }

    class Services extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Services",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* webserver/websites/KoesterVentures/src/components/Contact.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$2 = "webserver/websites/KoesterVentures/src/components/Contact.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let div7;
    	let h2;
    	let t1;
    	let p0;
    	let t3;
    	let div6;
    	let div4;
    	let div0;
    	let h30;
    	let t5;
    	let p1;
    	let a0;
    	let t7;
    	let div1;
    	let h31;
    	let t9;
    	let p2;
    	let t11;
    	let div3;
    	let h32;
    	let t13;
    	let div2;
    	let a1;
    	let t15;
    	let a2;
    	let t17;
    	let form;
    	let div5;
    	let input0;
    	let t18;
    	let input1;
    	let t19;
    	let input2;
    	let t20;
    	let textarea;
    	let t21;
    	let input3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div7 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Get in Touch";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Ready to bring your ideas to life? Let's discuss how we can help you achieve your goals.";
    			t3 = space();
    			div6 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Email";
    			t5 = space();
    			p1 = element("p");
    			a0 = element("a");
    			a0.textContent = "theo@koesterventures.com";
    			t7 = space();
    			div1 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Location";
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "Lakeland, FL";
    			t11 = space();
    			div3 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Follow Us";
    			t13 = space();
    			div2 = element("div");
    			a1 = element("a");
    			a1.textContent = "GitHub";
    			t15 = space();
    			a2 = element("a");
    			a2.textContent = "LinkedIn";
    			t17 = space();
    			form = element("form");
    			div5 = element("div");
    			input0 = element("input");
    			t18 = space();
    			input1 = element("input");
    			t19 = space();
    			input2 = element("input");
    			t20 = space();
    			textarea = element("textarea");
    			t21 = space();
    			input3 = element("input");
    			attr_dev(h2, "class", "svelte-3835f0");
    			add_location(h2, file$2, 22, 4, 389);
    			attr_dev(p0, "class", "section-description svelte-3835f0");
    			add_location(p0, file$2, 23, 4, 415);
    			attr_dev(h30, "class", "svelte-3835f0");
    			add_location(h30, file$2, 30, 10, 663);
    			attr_dev(a0, "href", "mailto:contact@koesterventures.com");
    			attr_dev(a0, "class", "svelte-3835f0");
    			add_location(a0, file$2, 31, 13, 691);
    			attr_dev(p1, "class", "svelte-3835f0");
    			add_location(p1, file$2, 31, 10, 688);
    			attr_dev(div0, "class", "info-item svelte-3835f0");
    			add_location(div0, file$2, 29, 8, 629);
    			attr_dev(h31, "class", "svelte-3835f0");
    			add_location(h31, file$2, 34, 10, 826);
    			attr_dev(p2, "class", "svelte-3835f0");
    			add_location(p2, file$2, 35, 10, 854);
    			attr_dev(div1, "class", "info-item svelte-3835f0");
    			add_location(div1, file$2, 33, 8, 792);
    			attr_dev(h32, "class", "svelte-3835f0");
    			add_location(h32, file$2, 38, 10, 931);
    			attr_dev(a1, "href", "https://github.com/MNwake");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noopener");
    			attr_dev(a1, "class", "svelte-3835f0");
    			add_location(a1, file$2, 40, 12, 999);
    			attr_dev(a2, "href", "https://www.linkedin.com/in/theo-koester-335a2a90");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "rel", "noopener");
    			attr_dev(a2, "class", "svelte-3835f0");
    			add_location(a2, file$2, 41, 12, 1089);
    			attr_dev(div2, "class", "social-links svelte-3835f0");
    			add_location(div2, file$2, 39, 10, 960);
    			attr_dev(div3, "class", "info-item svelte-3835f0");
    			add_location(div3, file$2, 37, 8, 897);
    			attr_dev(div4, "class", "contact-info svelte-3835f0");
    			add_location(div4, file$2, 28, 6, 594);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "input-name");
    			attr_dev(input0, "placeholder", "Name");
    			input0.required = true;
    			attr_dev(input0, "class", "svelte-3835f0");
    			add_location(input0, file$2, 48, 10, 1345);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "id", "input-email");
    			attr_dev(input1, "placeholder", "Email address");
    			input1.required = true;
    			attr_dev(input1, "class", "svelte-3835f0");
    			add_location(input1, file$2, 55, 10, 1521);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "input-subject");
    			attr_dev(input2, "placeholder", "Subject");
    			input2.required = true;
    			attr_dev(input2, "class", "svelte-3835f0");
    			add_location(input2, file$2, 62, 10, 1709);
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "id", "input-message");
    			attr_dev(textarea, "placeholder", "Message");
    			textarea.required = true;
    			attr_dev(textarea, "class", "svelte-3835f0");
    			add_location(textarea, file$2, 69, 10, 1894);
    			attr_dev(div5, "class", "form-inputs svelte-3835f0");
    			add_location(div5, file$2, 47, 8, 1309);
    			attr_dev(input3, "type", "submit");
    			input3.value = "Send Message";
    			attr_dev(input3, "id", "input-submit");
    			attr_dev(input3, "class", "svelte-3835f0");
    			add_location(input3, file$2, 77, 8, 2108);
    			attr_dev(form, "class", "contact-form cf svelte-3835f0");
    			add_location(form, file$2, 46, 6, 1245);
    			attr_dev(div6, "class", "contact-container svelte-3835f0");
    			add_location(div6, file$2, 27, 4, 556);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$2, 21, 2, 361);
    			attr_dev(section, "id", "contact");
    			attr_dev(section, "class", "section contact svelte-3835f0");
    			add_location(section, file$2, 20, 0, 312);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div7);
    			append_dev(div7, h2);
    			append_dev(div7, t1);
    			append_dev(div7, p0);
    			append_dev(div7, t3);
    			append_dev(div7, div6);
    			append_dev(div6, div4);
    			append_dev(div4, div0);
    			append_dev(div0, h30);
    			append_dev(div0, t5);
    			append_dev(div0, p1);
    			append_dev(p1, a0);
    			append_dev(div4, t7);
    			append_dev(div4, div1);
    			append_dev(div1, h31);
    			append_dev(div1, t9);
    			append_dev(div1, p2);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(div3, h32);
    			append_dev(div3, t13);
    			append_dev(div3, div2);
    			append_dev(div2, a1);
    			append_dev(div2, t15);
    			append_dev(div2, a2);
    			append_dev(div6, t17);
    			append_dev(div6, form);
    			append_dev(form, div5);
    			append_dev(div5, input0);
    			set_input_value(input0, /*formData*/ ctx[0].name);
    			append_dev(div5, t18);
    			append_dev(div5, input1);
    			set_input_value(input1, /*formData*/ ctx[0].email);
    			append_dev(div5, t19);
    			append_dev(div5, input2);
    			set_input_value(input2, /*formData*/ ctx[0].subject);
    			append_dev(div5, t20);
    			append_dev(div5, textarea);
    			set_input_value(textarea, /*formData*/ ctx[0].message);
    			append_dev(form, t21);
    			append_dev(form, input3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[3]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[4]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[5]),
    					listen_dev(form, "submit", /*handleSubmit*/ ctx[1], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*formData*/ 1 && input0.value !== /*formData*/ ctx[0].name) {
    				set_input_value(input0, /*formData*/ ctx[0].name);
    			}

    			if (dirty & /*formData*/ 1 && input1.value !== /*formData*/ ctx[0].email) {
    				set_input_value(input1, /*formData*/ ctx[0].email);
    			}

    			if (dirty & /*formData*/ 1 && input2.value !== /*formData*/ ctx[0].subject) {
    				set_input_value(input2, /*formData*/ ctx[0].subject);
    			}

    			if (dirty & /*formData*/ 1) {
    				set_input_value(textarea, /*formData*/ ctx[0].message);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);

    	let formData = {
    		name: '',
    		email: '',
    		subject: '',
    		message: ''
    	};

    	function handleSubmit(event) {
    		event.preventDefault();
    		console.log('Form submitted:', formData);

    		$$invalidate(0, formData = {
    			name: '',
    			email: '',
    			subject: '',
    			message: ''
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		formData.name = this.value;
    		$$invalidate(0, formData);
    	}

    	function input1_input_handler() {
    		formData.email = this.value;
    		$$invalidate(0, formData);
    	}

    	function input2_input_handler() {
    		formData.subject = this.value;
    		$$invalidate(0, formData);
    	}

    	function textarea_input_handler() {
    		formData.message = this.value;
    		$$invalidate(0, formData);
    	}

    	$$self.$capture_state = () => ({ formData, handleSubmit });

    	$$self.$inject_state = $$props => {
    		if ('formData' in $$props) $$invalidate(0, formData = $$props.formData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		formData,
    		handleSubmit,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		textarea_input_handler
    	];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* webserver/websites/KoesterVentures/src/components/Footer.svelte generated by Svelte v3.59.2 */

    const file$1 = "webserver/websites/KoesterVentures/src/components/Footer.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (34:12) {#each links.company as link}
    function create_each_block_2(ctx) {
    	let li;
    	let a;
    	let t_value = /*link*/ ctx[2].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", /*link*/ ctx[2].href);
    			attr_dev(a, "class", "svelte-1teksp2");
    			add_location(a, file$1, 34, 18, 1057);
    			attr_dev(li, "class", "svelte-1teksp2");
    			add_location(li, file$1, 34, 14, 1053);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(34:12) {#each links.company as link}",
    		ctx
    	});

    	return block;
    }

    // (43:12) {#each links.legal as link}
    function create_each_block_1(ctx) {
    	let li;
    	let a;
    	let t_value = /*link*/ ctx[2].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", /*link*/ ctx[2].href);
    			attr_dev(a, "class", "svelte-1teksp2");
    			add_location(a, file$1, 43, 18, 1289);
    			attr_dev(li, "class", "svelte-1teksp2");
    			add_location(li, file$1, 43, 14, 1285);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(43:12) {#each links.legal as link}",
    		ctx
    	});

    	return block;
    }

    // (52:12) {#each links.social as link}
    function create_each_block(ctx) {
    	let li;
    	let a;
    	let t0_value = /*link*/ ctx[2].text + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", /*link*/ ctx[2].href);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener");
    			attr_dev(a, "class", "svelte-1teksp2");
    			add_location(a, file$1, 53, 16, 1562);
    			attr_dev(li, "class", "svelte-1teksp2");
    			add_location(li, file$1, 52, 14, 1541);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(52:12) {#each links.social as link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let footer;
    	let div7;
    	let div5;
    	let div0;
    	let h3;
    	let t1;
    	let p0;
    	let t3;
    	let div4;
    	let div1;
    	let h40;
    	let t5;
    	let ul0;
    	let t6;
    	let div2;
    	let h41;
    	let t8;
    	let ul1;
    	let t9;
    	let div3;
    	let h42;
    	let t11;
    	let ul2;
    	let t12;
    	let div6;
    	let p1;
    	let each_value_2 = /*links*/ ctx[1].company;
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*links*/ ctx[1].legal;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*links*/ ctx[1].social;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div7 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Koester Ventures";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Building innovative software solutions for the modern world.";
    			t3 = space();
    			div4 = element("div");
    			div1 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Company";
    			t5 = space();
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t6 = space();
    			div2 = element("div");
    			h41 = element("h4");
    			h41.textContent = "Legal";
    			t8 = space();
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t9 = space();
    			div3 = element("div");
    			h42 = element("h4");
    			h42.textContent = "Connect";
    			t11 = space();
    			ul2 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t12 = space();
    			div6 = element("div");
    			p1 = element("p");
    			p1.textContent = `© ${/*currentYear*/ ctx[0]} Koester Ventures. All rights reserved.`;
    			attr_dev(h3, "class", "svelte-1teksp2");
    			add_location(h3, file$1, 25, 8, 767);
    			attr_dev(p0, "class", "svelte-1teksp2");
    			add_location(p0, file$1, 26, 8, 801);
    			attr_dev(div0, "class", "footer-brand svelte-1teksp2");
    			add_location(div0, file$1, 24, 6, 732);
    			attr_dev(h40, "class", "svelte-1teksp2");
    			add_location(h40, file$1, 31, 10, 965);
    			attr_dev(ul0, "class", "svelte-1teksp2");
    			add_location(ul0, file$1, 32, 10, 992);
    			attr_dev(div1, "class", "link-group svelte-1teksp2");
    			add_location(div1, file$1, 30, 8, 930);
    			attr_dev(h41, "class", "svelte-1teksp2");
    			add_location(h41, file$1, 40, 10, 1201);
    			attr_dev(ul1, "class", "svelte-1teksp2");
    			add_location(ul1, file$1, 41, 10, 1226);
    			attr_dev(div2, "class", "link-group svelte-1teksp2");
    			add_location(div2, file$1, 39, 8, 1166);
    			attr_dev(h42, "class", "svelte-1teksp2");
    			add_location(h42, file$1, 49, 10, 1433);
    			attr_dev(ul2, "class", "social-links svelte-1teksp2");
    			add_location(ul2, file$1, 50, 10, 1460);
    			attr_dev(div3, "class", "link-group svelte-1teksp2");
    			add_location(div3, file$1, 48, 8, 1398);
    			attr_dev(div4, "class", "footer-links svelte-1teksp2");
    			add_location(div4, file$1, 29, 6, 895);
    			attr_dev(div5, "class", "footer-main svelte-1teksp2");
    			add_location(div5, file$1, 23, 4, 700);
    			attr_dev(p1, "class", "svelte-1teksp2");
    			add_location(p1, file$1, 64, 6, 1803);
    			attr_dev(div6, "class", "footer-bottom svelte-1teksp2");
    			add_location(div6, file$1, 63, 4, 1769);
    			attr_dev(div7, "class", "container footer-content svelte-1teksp2");
    			add_location(div7, file$1, 22, 2, 657);
    			attr_dev(footer, "class", "footer svelte-1teksp2");
    			add_location(footer, file$1, 21, 0, 631);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div7);
    			append_dev(div7, div5);
    			append_dev(div5, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, h40);
    			append_dev(div1, t5);
    			append_dev(div1, ul0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				if (each_blocks_2[i]) {
    					each_blocks_2[i].m(ul0, null);
    				}
    			}

    			append_dev(div4, t6);
    			append_dev(div4, div2);
    			append_dev(div2, h41);
    			append_dev(div2, t8);
    			append_dev(div2, ul1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(ul1, null);
    				}
    			}

    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, h42);
    			append_dev(div3, t11);
    			append_dev(div3, ul2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul2, null);
    				}
    			}

    			append_dev(div7, t12);
    			append_dev(div7, div6);
    			append_dev(div6, p1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*links*/ 2) {
    				each_value_2 = /*links*/ ctx[1].company;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*links*/ 2) {
    				each_value_1 = /*links*/ ctx[1].legal;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*links*/ 2) {
    				each_value = /*links*/ ctx[1].social;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const currentYear = new Date().getFullYear();

    	const links = {
    		company: [
    			{ text: "About", href: "#about" },
    			{ text: "Services", href: "#services" },
    			{ text: "Portfolio", href: "#portfolio" },
    			{ text: "Contact", href: "#contact" }
    		],
    		legal: [
    			{
    				text: "Privacy Policy",
    				href: "/privacy_policy.html"
    			},
    			{
    				text: "Terms of Service",
    				href: "/terms.html"
    			}
    		],
    		social: [
    			{
    				text: "GitHub",
    				href: "https://github.com/theopkoester",
    				icon: "github"
    			},
    			{
    				text: "LinkedIn",
    				href: "https://linkedin.com/in/theopkoester",
    				icon: "linkedin"
    			}
    		]
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ currentYear, links });
    	return [currentYear, links];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* webserver/websites/KoesterVentures/src/components/App.svelte generated by Svelte v3.59.2 */
    const file = "webserver/websites/KoesterVentures/src/components/App.svelte";

    function create_fragment(ctx) {
    	let div;
    	let nav;
    	let t0;
    	let main;
    	let hero;
    	let t1;
    	let portfolio;
    	let t2;
    	let services;
    	let t3;
    	let contact;
    	let t4;
    	let footer;
    	let current;
    	nav = new Nav({ $$inline: true });
    	hero = new Hero({ $$inline: true });
    	portfolio = new Portfolio({ $$inline: true });
    	services = new Services({ $$inline: true });
    	contact = new Contact({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(nav.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(hero.$$.fragment);
    			t1 = space();
    			create_component(portfolio.$$.fragment);
    			t2 = space();
    			create_component(services.$$.fragment);
    			t3 = space();
    			create_component(contact.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "svelte-1iqruvu");
    			add_location(main, file, 11, 2, 292);
    			attr_dev(div, "class", "app svelte-1iqruvu");
    			add_location(div, file, 9, 0, 262);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(nav, div, null);
    			append_dev(div, t0);
    			append_dev(div, main);
    			mount_component(hero, main, null);
    			append_dev(main, t1);
    			mount_component(portfolio, main, null);
    			append_dev(main, t2);
    			mount_component(services, main, null);
    			append_dev(main, t3);
    			mount_component(contact, main, null);
    			append_dev(div, t4);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(hero.$$.fragment, local);
    			transition_in(portfolio.$$.fragment, local);
    			transition_in(services.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(hero.$$.fragment, local);
    			transition_out(portfolio.$$.fragment, local);
    			transition_out(services.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(nav);
    			destroy_component(hero);
    			destroy_component(portfolio);
    			destroy_component(services);
    			destroy_component(contact);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Nav,
    		Hero,
    		Portfolio,
    		Services,
    		Contact,
    		Footer
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.getElementById('app')
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
